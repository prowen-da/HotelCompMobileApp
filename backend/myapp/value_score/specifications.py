def build_specification(hotel, is_best_value):
    try:
        tags = []
        description = ""

        if is_best_value:
            description = f"{hotel['hotel_name']} is the best value hotel in the market"
            tags = ["Best Value"]
        elif hotel["rating"] >= 4.5:
            description = "Luxury hotel offering world-class amenities"
            tags = ["Luxury", "Top Rated"]
        elif hotel["lowest_price"] <= 150:
            description = "Budget-friendly hotel suitable for short stays"
            tags = ["Budget"]
        else:
            description = "Comfortable mid-range hotel with decent facilities"
            tags = ["Mid-range"]

        return {
            "description": description,
            "tags": tags
        }
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_lineno)