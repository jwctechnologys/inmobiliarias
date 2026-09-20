function Administrador (){
    return(
        <>   
            <li><a href="#">Calificar inquilinos</a></li>
            <li><a href="#">Calificar proveedores</a></li>
            <li><a href="#">Validar fallas</a></li>
            <li><a href="#">Edición Casas</a></li>
            <li><a href="#">Cuentas por pagar</a></li>
            <li><a href="#">Editar Usuarios</a></li>
        </> 
    )
}

function Propietario (){
    return(
        <>   
            <li><a href="#">Calificar inquilinos</a></li>
            <li><a href="#">Calificar proveedores</a></li>
            <li><a href="#">Validar fallas</a></li>
            <li><a href="#">Edición Casas</a></li>
            <li><a href="#">Cuentas por pagar</a></li>
            
        </> 
    )
}
function Inquilino (){
    return(
        <>   
            <li><a href="#">Validar fallas</a></li>
            <li><a href="#">Cuentas por pagar</a></li>
            
        </> 
    )
}
function Proveedor (){
    return(
        <>   
            <li><a href="#">Validar fallas</a></li>
            <li><a href="#">Cuentas por pagar</a></li>
            
        </> 
    )
}
function Todos (){
    return(
        <>   
            <li><a href="#">Casas en venta</a></li>
            <li><a href="#">Casas para arrendar</a></li>
            <li><a href="#">¿Quienes somos?</a></li>
            
        </> 
    )
}
export default function Encabezadodos(props) {
    const isLoggedIn = 'Administrador';
    if (isLoggedIn == 'Administrador') {

        return (
            <>

                <Administrador />
                <Todos />
                <li><a href="#">Cerrar Sesión</a></li>
                </>
         )
    } else if (isLoggedIn == 'Propietario') {
        return (
            <>
                <Propietario />
                <Todos />
                <li><a href="#">Cerrar Sesión</a></li>
                </>
        )
    } else if (isLoggedIn == 'Inquilino') {
        return (
            <>
                <Inquilino />
                <Todos />
                <li><a href="#">Cerrar Sesión</a></li>
                </>
        )
    } else if (isLoggedIn == 'Proveedor') {
        return (
            <>
                <Proveedor />
                <Todos />
                <li><a href="#">Cerrar Sesión</a></li>
                </>

        )
    } else {
        return (
            <>
            <Todos />
            <li><a href="#">Iniciar Sesión</a></li>
            <li><a href="#">Registrarse</a></li>
            </>
        )

    }

}


