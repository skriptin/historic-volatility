import sys



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


def get_total_size(obj, seen=None):
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0
    seen.add(obj_id)

    size = sys.getsizeof(obj)

    if isinstance(obj, dict):
        size += sum(get_total_size(k, seen) + get_total_size(v, seen) for k, v in obj.items())
    elif hasattr(obj, '__dict__'):
        size += get_total_size(vars(obj), seen)
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
        size += sum(get_total_size(i, seen) for i in obj)

    return size