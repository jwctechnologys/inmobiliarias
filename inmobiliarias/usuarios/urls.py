from django.urls import path

from . import views

urlpatterns = [
    path('api/csrf/', views.get_csrf_token, name='get_csrf_token'),
    path('api/create/', views.user_create_view, name='user_create'),
    path('api/completar-perfil/', views.completar_perfil_view, name='completar_perfil'),
    path('api/login/', views.login_view),
    path('api/logout/', views.logout_view),
    path('api/user_profile_update/', views.user_profile_update_view, name='user_profile_update'),
    path('api/usuarios_por_grupo/<str:grupo_nombre>/', views.listar_usuarios_por_grupo, name='listar_usuarios_por_grupo'),
    path('api/usuarios_por_grupo/<str:grupo_nombre>/<int:id>/', views.listar_usuarios_por_grupo, name='listar_usuarios_por_grupo'),
    path('api/arrendatarios/', views.listar_arrendatarios, name='listar_arrendatarios'),
]

# (prefijo, viewset[, basename]); el urls.py del proyecto las registra en un unico router.
router_routes = [
    (r'AdministradorViewSet', views.AdministradorViewSet),
    (r'ArrendatarioViewSet', views.ArrendatarioViewSet),
]
