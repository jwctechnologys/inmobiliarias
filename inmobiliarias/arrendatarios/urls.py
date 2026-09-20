from django.urls import path

from . import views

urlpatterns = [
    path('api/coarrendatarios/create/', views.create_coarrendatario, name='create_coarrendatario'),
    path('api/coarrendatario/', views.listar_coarrendatarios, name='listar_coarrendatarios'),
    path('api/coarrendatarios/<int:pk>/', views.update_coarrendatario, name='update_coarrendatario'),

    path('api/dependientes/create/', views.create_dependientes, name='create_dependientes'),
    path('api/dependientes/', views.listar_dependientes, name='listar_dependientes'),
    path('api/dependiente/<int:pk>/', views.update_dependiente, name='update_dependiente'),
    path('api/dependientes/<int:arrendatario_id>/', views.get_dependientes_por_arrendatario, name='get_dependientes'),

    path('api/referencias/create/', views.create_referencias, name='create_referencias'),
    path('api/referencias/', views.listar_referencias, name='listar_referencias'),
    path('api/referencias/<int:pk>/', views.update_referencias, name='update_referencias'),
]

router_routes = []
