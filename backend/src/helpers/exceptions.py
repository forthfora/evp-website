from django.http import Http404

class ResourceNotFound(Http404):
    def __init__(self, resource: str) -> None:
        self.resource = resource
        super().__init__(f"{resource} not found")

