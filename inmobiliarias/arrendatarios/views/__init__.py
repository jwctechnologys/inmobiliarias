"""Vistas de arrendatarios, agrupadas por tema."""

from .coarrendatarios import (
    create_coarrendatario,
    listar_coarrendatarios,
    update_coarrendatario,
)
from .dependientes import (
    create_dependientes,
    get_dependientes_por_arrendatario,
    listar_dependientes,
    update_dependiente,
)
from .ingresos import (
    actualizar_declaracion_ingresos,
    crear_declaracion_ingresos,
    eliminar_declaracion_ingresos,
    listar_declaraciones_ingresos,
)
from .referencias import create_referencias, listar_referencias, update_referencias

__all__ = ["listar_coarrendatarios", "create_coarrendatario", "update_coarrendatario", "create_dependientes", "get_dependientes_por_arrendatario", "update_dependiente", "listar_dependientes", "create_referencias", "listar_referencias", "update_referencias", "listar_declaraciones_ingresos", "crear_declaracion_ingresos", "actualizar_declaracion_ingresos", "eliminar_declaracion_ingresos"]
