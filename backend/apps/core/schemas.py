from typing import ClassVar

from ninja import Schema
from pydantic import model_validator


class CSRFOut(Schema):
    csrftoken: str


class ContactIn(Schema):
    name: str
    email: str
    message: str


class PatchSchema(Schema):
    """Base class for PATCH payloads.

    PATCH fields are declared ``X | None = None`` so that omitted fields
    stay out of ``model_dump(exclude_unset=True)``. An explicit ``null`` in
    the payload, however, counts as "set" and would assign ``None`` to
    non-nullable model fields (→ IntegrityError/500). This validator turns
    explicit ``null`` into a 422 instead.

    Fields whose model column is genuinely nullable (e.g.
    ``StartupEntry.founding_date``) are exempted via ``nullable_fields``.
    """

    nullable_fields: ClassVar[frozenset[str]] = frozenset()

    @model_validator(mode="after")
    def _reject_explicit_nulls(self) -> "PatchSchema":
        for name in self.model_fields_set:
            if name in self.nullable_fields:
                continue
            if getattr(self, name) is None:
                raise ValueError(
                    f"{name}: null is not allowed; omit the field to leave it unchanged"
                )
        return self
