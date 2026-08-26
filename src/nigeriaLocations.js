const NIGERIA_LOCATIONS_URL =
  "https://raw.githubusercontent.com/open-admin-data/nigeria-administrative-divisions/master/data/hierarchy.json";

let cachedLocations = null;

export async function loadNigeriaLocations() {
  if (cachedLocations) {
    return cachedLocations;
  }

  const response = await fetch(NIGERIA_LOCATIONS_URL, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Unable to load Nigerian locations.");
  }

  const json = await response.json();

  const states = (json.data || []).map((state) => ({
    name: state.name?.en || state.name?.local || "",
    cities: (state.lga || [])
      .map((lga) => lga.name?.en || lga.name?.local || "")
      .filter(Boolean),
  }));

  cachedLocations = states;

  return states;
}