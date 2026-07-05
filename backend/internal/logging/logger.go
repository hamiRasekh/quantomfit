package logging

import (
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func New(env string) zerolog.Logger {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	logger := log.Output(os.Stdout).With().Timestamp().Logger()
	if env != "development" {
		return logger.Level(zerolog.InfoLevel)
	}
	return logger.Level(zerolog.DebugLevel)
}

