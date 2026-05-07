1. **Modify `src/App.tsx`:**
    *   **Remove `EmbeddedApp` from `DashboardHome`:** Delete the line `<EmbeddedApp />` within the `DashboardHome` component to prevent the farming tool from being displayed by default on the dashboard.
    *   **Enhance `AppGallery` for default selection:** In the `AppGallery` component, add a `useEffect` hook that runs when the component mounts or when `userApps` or `selectedApp` changes. This hook will check if `selectedApp` is null and if the first app in `userApps` is the "Farming Assistant" (assuming it has `id: 'app1'`). If both conditions are true, it will automatically set `selectedApp` to this "Farming Assistant" app. This ensures the tool is displayed immediately after the "Farming Tools" tab is clicked.
    *   **Verify `AVAILABLE_APPS` URL:** Confirm that the `url` for the "Farming Assistant" in the `AVAILABLE_APPS` array within `src/App.tsx` is correctly set to `https://app.farming-assistant.kenya-avocado.ke/share?userId=3965&id=15527`.

2.  **Validate the changes:** After applying the modifications, ensure that:
    *   The dashboard no longer shows the embedded iframe by default.
    *   Clicking the "Farming Tools" navigation item displays the `AppGallery`.
    *   The "Farming Assistant" tool opens automatically when the "Farming Tools" tab is selected.
    *   Existing authentication and navigation functionality remain intact.