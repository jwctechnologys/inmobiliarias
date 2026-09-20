from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import *
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
# Create your views here.
"""
@login_required(login_url="/inicioSesion/")

def home(request):
    context = { 'page' : 'Inmobiliaria'}
    return render(request, "inicio/index.html" , context)

@login_required(login_url="/inicioSesion/")
def registrocasas(request):
    context = { 'page' : 'Inmobiliaria Registros'}
    if request.method=="POST":

        data=request.POST
        direccion=data.get('direccion')
        estado=data.get('estado')
        propietario=data.get('propietario')
        fotoCasa=request.FILES.get('fotoCasa')
        
        Casa.objects.create(
            direccion = direccion,
            estado = estado,
            propietario = propietario,
            fotoCasa = fotoCasa,

            )
        return redirect('/registro/')
        #print(direccion)
        #print(estado)
        #print(propietario)
        #print(fotoCasa)
    queryset = Casa.objects.all()

    if request.GET.get('Buscar'):
        queryset = queryset.filter(direccion__icontains = request.GET.get('Buscar'))

    context = {'page' : 'Inmobiliaria Registros','registrocasas':queryset}
    return render(request, "inicio/registrocasas.html" , context)


@login_required(login_url="/inicioSesion/")
def actualizar_Casa(request,id):
    queryset = Casa.objects.get(id=id)
    if request.method=="POST":
        
        data=request.POST
        direccion=data.get('direccion')
        estado=data.get('estado')
        propietario=data.get('propietario')
        fotoCasa=request.FILES.get('fotoCasa')

        queryset.direccion = direccion
        queryset.estado = estado
        queryset.propietario = propietario
        if fotoCasa:
            queryset.fotoCasa = fotoCasa
        queryset.save()
        return redirect('/registro/')

    context = {'page' : 'Inmobiliaria Actualizando', 'casa' : queryset}
    return render (request, 'inicio/actualizar_Casa.html', context)

@login_required(login_url="/inicioSesion/")
def eliminar_Casa(request,id):
    queryset = Casa.objects.get(id=id)
    queryset.delete()
    return redirect('/registro/')


def casaventas(request):
    context = { 'page' : 'Inmobiliaria Ventas'}
    return render(request, "inicio/casaventas.html" , context)
    
def casaarriendo(request):
    context = { 'page' : 'Inmobiliaria Arriendo'}
    return render(request, "inicio/casaarriendo.html" , context)
@login_required(login_url="/inicioSesion/")
def formatos(request):

    context = { 'page' : 'Inmobiliaria Formatos'}
    return render(request, "inicio/formatos.html" , context)

def inicioSesion(request):

    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
    
        if not User.objects.filter(username = username).exists():
            messages.error(request, 'Usuario o contraseña invalidos')
            return redirect('/inicioSesion/')

        user = authenticate(username = username, password = password)

        if user is None:
            messages.error(request, 'Usuario o contraseña invalidos')
            return redirect('/inicioSesion/')
    
        else: 
            login(request, user)
            return redirect('/registro/')
    
    return render(request , 'inicio/iniciosesion.html')

def cerrarSesion(request):
    logout(request)
    return redirect('/inicioSesion/')

def registrarse(request):

    
    if request.method == "POST":
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = User.objects.filter(username = username)

        if user.exists():
            messages.info(request, 'El usuario ya existe')
            return redirect('/registrarse/')

        user = User.objects.create(
            first_name  = first_name,
            last_name  = last_name,
            username  = username,
            email  = email,
        )

        user.set_password(password)
        user.save

        messages.info(request, 'Usuario creado con exito')

        return redirect('/registrarse/')

    return render(request , 'inicio/registrarse.html')

    """