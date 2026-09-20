


# Funciones para las operaciones
def mostrar_elementos(numeros):
    print("\nElementos del arreglo:")
    for numero in numeros:
        print(numero)

def sumar_elementos(numeros):
    suma = sum(numeros)  # Calcula la suma de todos los elementos
    print("\nLa suma de los elementos es:", suma)

def encontrar_maximo(numeros):
    maximo = max(numeros)  # Encuentra el valor máximo en el arreglo
    print("El valor máximo del arreglo es:", maximo)

# Función para crear un nuevo arreglo
def crear_arreglo():
    cantidad = int(input("¿Cuántos números deseas ingresar? "))
    numeros = []
    for i in range(cantidad):
        numero = int(input(f"Ingrese el número {i + 1}: "))
        numeros.append(numero)
    return numeros

# Programa principal
while True:
    print("\n¿Deseas crear un nuevo arreglo o usar el arreglo existente?")
    print("1. Crear un nuevo arreglo")
    print("2. Usar el arreglo existente")
    print("3. Salir")
    print("\n\nPROGRAMA PARA TRABAJAR CON LOS VALORES DENTRO DE UN ARREGLO")
    print("PROGRAMA PROGRAMA ELABORADO POR EL ESTUDIANTE JERSON RAMIREZ")
    
    opcion_principal = input("Opción: ")
    
    # Crear un nuevo arreglo
    if opcion_principal == '1':
        numeros = crear_arreglo()
    # Salir del programa
    elif opcion_principal == '3':
        print("Saliendo del programa.")
        break
    # Verificar si hay un arreglo existente
    elif opcion_principal == '2' and 'numeros' not in locals():
        print("No tienes un arreglo creado. Por favor, crea uno primero.")
        continue
    elif opcion_principal == '2':
        pass  # Si ya existe un arreglo, continuamos
    
    # Menú de operaciones
    while True:
        print("\nElige una operación:")
        print("1. Mostrar todos los elementos")
        print("2. Calcular la suma de los elementos")
        print("3. Encontrar el valor máximo")
        print("4. Volver al menú principal")
        print("\n\nPROGRAMA PARA TRABAJAR CON LOS VALORES DENTRO DE UN ARREGLO")
        print("PROGRAMA PROGRAMA ELABORADO POR EL ESTUDIANTE JERSON RAMIREZ")

        opcion_operacion = input("Opción: ")

        if opcion_operacion == '1':
            mostrar_elementos(numeros)
        elif opcion_operacion == '2':
            sumar_elementos(numeros)
        elif opcion_operacion == '3':
            encontrar_maximo(numeros)
        elif opcion_operacion == '4':
            break  # Regresar al menú principal
        else:
            print("Opción no válida. Inténtalo de nuevo.")
