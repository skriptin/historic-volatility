def convertStrToList(target) -> list[int]:
    if target is None:
        return []

    if isinstance(target, list):
        result = []
        for x in target:
            try:
                if str(x).strip():
                    result.append(int(x))
            except ValueError:
                continue
        return result

    if isinstance(target, str):
        cleaned = target.strip()
        if cleaned == "" or cleaned == "[]" or cleaned == "['']":
            return []
        items = cleaned.replace(',', ' ').split()
        result = []
        for item in items:
            try:
                if item.strip():
                    result.append(int(item))
            except ValueError:
                continue
        return result

    try:
        return [int(target)]
    except Exception:
        return []