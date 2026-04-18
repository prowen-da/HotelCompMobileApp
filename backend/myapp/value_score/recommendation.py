def build_recommendations(ranked_hotels):
    if not ranked_hotels:
        return {}

    best_budget = min(
        ranked_hotels[: max(1, len(ranked_hotels) // 2)],
        key=lambda x: x["lowest_price"]
    )

    premium_stay = max(
        ranked_hotels[: max(1, len(ranked_hotels) // 3)],
        key=lambda x: x["lowest_price"]
    )

    balanced = ranked_hotels[len(ranked_hotels) // 2]

    return {
        "best_budget": best_budget["hotel_name"],
        "best_overall": ranked_hotels[0]["hotel_name"],
        "premium_stay": premium_stay["hotel_name"],
        "balanced_choice": balanced["hotel_name"]
    }
