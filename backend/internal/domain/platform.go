package domain

import "time"

type Platform struct {
	Name      string
	Version   string
	Env       string
	BuiltAt   time.Time
	StartedAt time.Time
}

func NewPlatform(name, version, env string, builtAt, startedAt time.Time) Platform {
	return Platform{
		Name:      name,
		Version:   version,
		Env:       env,
		BuiltAt:   builtAt.UTC(),
		StartedAt: startedAt.UTC(),
	}
}

