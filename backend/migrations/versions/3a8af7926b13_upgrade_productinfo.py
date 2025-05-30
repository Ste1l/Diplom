"""Upgrade ProductInfo

Revision ID: 3a8af7926b13
Revises: 301ea3a98115
Create Date: 2024-10-20 17:37:46.438859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a8af7926b13'
down_revision: Union[str, None] = '301ea3a98115'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('product_info',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=True),
    sa.Column('composition', sa.String(), nullable=True),
    sa.Column('pharmacological_action', sa.String(), nullable=True),
    sa.Column('indications', sa.String(), nullable=True),
    sa.Column('contraindications', sa.String(), nullable=True),
    sa.Column('side_effects', sa.String(), nullable=True),
    sa.Column('interactions', sa.String(), nullable=True),
    sa.Column('dosage', sa.String(), nullable=True),
    sa.Column('overdose', sa.String(), nullable=True),
    sa.Column('full_description', sa.String(), nullable=True),
    sa.Column('storage_conditions', sa.String(), nullable=True),
    sa.Column('shelf_life', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('product_info')
    # ### end Alembic commands ###
