def parse_indices(index_str: str) -> set[int]:
    """
    Parses a string of space-separated indices and hyphenated ranges.
    Example: "1-3 7 9" -> {1, 2, 3, 7, 9}
    """
    indices = set()
    parts = index_str.split()
    for part in parts:
        if "-" in part:
            try:
                start_str, end_str = part.split("-")
                start, end = int(start_str), int(end_str)
                for i in range(start, end + 1):
                    indices.add(i)
            except (ValueError, IndexError):
                continue
        else:
            try:
                indices.add(int(part))
            except ValueError:
                continue
    return indices
