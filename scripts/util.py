def convertStrToList(target: str) -> list[int]:

    items = target.replace(',', ' ').split()
    return [int(x) for x in items if x.strip()]
