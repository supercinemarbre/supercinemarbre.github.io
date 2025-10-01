## Root layout

* `config/`
* `[feature]/`
* `shared/`

## Feature layout

* UI
    * UI: Components
        * `ui/[Page.vue]`
        * `ui/organisms/` Stateful components
        * `ui/molecules/` Dumb components
        * `ui/atoms/` Low-level design elements
    * UI: Logic (formatting etc.)
        * `ui/logic/`
    * UI: CSS/SASS styles
        * `ui/styles/`
* Models / business logic
    * `model/`
* Services (higher order logic)
    * `services/`
* Infrastructure (clients & stores)
    * `infra/`
* Public API for other features
    * `api/`
* `[sub-feature]/`
* `shared/`

# Shared layout

Like Feature but without sub-features or shared folder.
