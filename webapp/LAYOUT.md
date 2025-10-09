## Root layout

* `config/`
* `[feature]/`
* `shared/`

## Feature layout

* UI
    * UI: Components
        * `_ui/[Page.vue]`
        * `_ui/organisms/` Stateful or feature-level components
        * `_ui/molecules/` Dumb components
        * `_ui/atoms/` Low-level design elements
    * UI: Logic (formatting etc.)
        * `_ui/logic/`
    * UI: CSS/SASS styles
        * `_ui/styles/`
* Models / business logic
    * `_model/`
* Services (higher order logic)
    * `_services/`
* Infrastructure (clients & stores)
    * `_infra/`
* Public API for other features
    * `[feature].api.ts`
* `[sub-feature]/`
* `shared/`

# Shared layout

Like Feature but without sub-features or shared folder.
