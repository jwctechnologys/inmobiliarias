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
export default function Encabezado(props) {
    const isLoggedIn = 'Administrador';
    if (isLoggedIn == 'Administrador') {

        return (
            
            <div className="enc">
                <Administrador />
                <Todos />
                <li><a href="#">Cerrar Sesión</a></li>
            </div>
         )
    } else if (isLoggedIn == 'Propietario') {
        return (
            <div className="enc"> 
                <Propietario />
                <Todos />
                <li><a href="#">Cerrar Sesión</a></li>
            </div>
        )
    } else if (isLoggedIn == 'Inquilino') {
        return (
            <div className="enca">
                <Inquilino />
                <Todos />
                <li><a href="#">Cerrar Sesión</a></li>
            </div>
        )
    } else if (isLoggedIn == 'Proveedor') {
        return (
            <div className="enca">
                <Proveedor />
                <Todos />
                <li><a href="#">Cerrar Sesión</a></li>

            </div>
        )
    } else {
        return (
        <div className="enca">
            <Todos />
            <li><a href="#">Iniciar Sesión</a></li>
            <li><a href="#">Registrarse</a></li>
        </div>
        )

    }

}


