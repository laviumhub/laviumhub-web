# Data Layer

- `json/`: temporary static source.
- `types/`: source-specific raw interfaces.
- `mappers/`: raw-to-domain normalization.

UI components should consume only domain models from `src/domain`, not raw data contracts.
