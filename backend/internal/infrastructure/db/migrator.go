package db

import (
	"context"
	"database/sql"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type Migrator struct {
	dsn         string
	migrations  string
	seeders     string
}

func NewMigrator(dsn, migrationsDir, seedersDir string) *Migrator {
	return &Migrator{dsn: dsn, migrations: migrationsDir, seeders: seedersDir}
}

func (m *Migrator) Run(ctx context.Context) error {
	if strings.TrimSpace(m.dsn) == "" {
		return nil
	}

	db, err := sql.Open("pgx", m.dsn)
	if err != nil {
		return err
	}
	defer db.Close()

	if err := db.PingContext(ctx); err != nil {
		return err
	}

	if err := m.ensureJournalTables(ctx, db); err != nil {
		return err
	}

	if err := m.applyDir(ctx, db, "schema_migrations", m.migrations); err != nil {
		return err
	}
	return m.applyDir(ctx, db, "seed_journal", m.seeders)
}

func (m *Migrator) ensureJournalTables(ctx context.Context, db *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`,
		`CREATE TABLE IF NOT EXISTS seed_journal (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`,
	}
	for _, stmt := range stmts {
		if _, err := db.ExecContext(ctx, stmt); err != nil {
			return err
		}
	}
	return nil
}

func (m *Migrator) applyDir(ctx context.Context, db *sql.DB, journal string, dir string) error {
	if strings.TrimSpace(dir) == "" {
		return nil
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	files := make([]fs.DirEntry, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".sql") {
			files = append(files, entry)
		}
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].Name() < files[j].Name()
	})

	for _, file := range files {
		path := filepath.Join(dir, file.Name())
		applied, err := alreadyApplied(ctx, db, journal, file.Name())
		if err != nil {
			return err
		}
		if applied {
			continue
		}

		content, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", path, err)
		}
		if _, err := db.ExecContext(ctx, string(content)); err != nil {
			return fmt.Errorf("execute migration %s: %w", path, err)
		}
		if _, err := db.ExecContext(ctx, fmt.Sprintf(`INSERT INTO %s (filename, applied_at) VALUES ($1, $2)`, journal), file.Name(), time.Now().UTC()); err != nil {
			return fmt.Errorf("record migration %s: %w", path, err)
		}
	}

	return nil
}

func alreadyApplied(ctx context.Context, db *sql.DB, journal, filename string) (bool, error) {
	query := fmt.Sprintf(`SELECT 1 FROM %s WHERE filename = $1`, journal)
	var one int
	err := db.QueryRowContext(ctx, query, filename).Scan(&one)
	if err == nil {
		return true, nil
	}
	if err == sql.ErrNoRows {
		return false, nil
	}
	return false, err
}
