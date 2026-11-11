from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UserBaseSchema(BaseModel):
    name: str
    email: str
    role: str = Field(default="faculty", description="faculty | student | admin")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class UserCreateSchema(UserBaseSchema):
    password: Optional[str] = None


class UserResponseSchema(UserBaseSchema):
    id: Optional[str] = Field(default=None, alias="_id")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")
