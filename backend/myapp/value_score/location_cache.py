import py_countries_states_cities_database as csc

# Load all data once
COUNTRIES = csc.get_all_countries()
STATES = csc.get_all_states()
CITIES = csc.get_all_cities()

# --- Build lookup maps ---

COUNTRY_MAP = {
    country["id"]: country["name"]
    for country in COUNTRIES
}

STATE_MAP = {
    state["id"]: {
        "name": state["name"],
        "country_id": state["country_id"]
    }
    for state in STATES
}

# --- Enrich cities with state & country ---
ENRICHED_CITIES = []

for city in CITIES:
    state = STATE_MAP.get(city.get("state_id"))
    if not state:
        continue

    country_name = COUNTRY_MAP.get(state["country_id"])

    ENRICHED_CITIES.append({
        "id": city["id"],
        "city": city["name"],
        "state": state["name"],
        "country": country_name,
        "latitude": city["latitude"],
        "longitude": city["longitude"]
    })
