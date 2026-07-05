package config

import (
	"os"
	"strings"
	"time"
)

type Config struct {
	AppName    string
	AppVersion string
	Env        string
	BuiltAt    time.Time
	JWTSecret  string
	HTTP       HTTPConfig
}

type HTTPConfig struct {
	Addr         string
	CORSOrigins   []string
	ReadTimeout   time.Duration
	WriteTimeout  time.Duration
	IdleTimeout   time.Duration
}

func Load() Config {
	return Config{
		AppName:    getenv("APP_NAME", "quantomfit-api"),
		AppVersion: getenv("APP_VERSION", "dev"),
		Env:        getenv("APP_ENV", "development"),
		BuiltAt:    mustParseTime(getenv("BUILT_AT", time.Now().UTC().Format(time.RFC3339))),
		JWTSecret:  getenv("JWT_SECRET", "quantomfit-dev-secret"),
		HTTP: HTTPConfig{
			Addr:        getenv("HTTP_ADDR", ":8080"),
			CORSOrigins: splitCSV(getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004")),
			ReadTimeout: mustDuration(getenv("HTTP_READ_TIMEOUT", "10s"), 10*time.Second),
			WriteTimeout: mustDuration(getenv("HTTP_WRITE_TIMEOUT", "10s"), 10*time.Second),
			IdleTimeout: mustDuration(getenv("HTTP_IDLE_TIMEOUT", "60s"), time.Minute),
		},
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(value string) []string {
	if value == "" {
		return nil
	}

	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func mustParseTime(value string) time.Time {
	t, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return time.Now().UTC()
	}
	return t.UTC()
}

func mustDuration(value string, fallback time.Duration) time.Duration {
	if value == "" {
		return fallback
	}
	d, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return d
}
