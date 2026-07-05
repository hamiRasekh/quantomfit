package config

func (c Config) DatabaseURL() string {
	return getenv("DATABASE_URL", "postgres://quantumfit:quantumfit@localhost:5432/quantumfit?sslmode=disable")
}
