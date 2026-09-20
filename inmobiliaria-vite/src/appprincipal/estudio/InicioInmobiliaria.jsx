import React from 'react';
import Encabezado from './/encabezado';


import BotonRs from './Menudesp';
import Cuerpoprincipal from './Cuerpoprincipal';

import Minicuerpo from './Minicuerpos';
import Paginacion from './Paginacion';
import Introduccion from './Introduccion';
import Piedepagina from './Piedepagina';



function InicioInmobiliaria() {
  return (


    <div id="wrapper">

      {/* Header */}

      <header id="header" >
      <div className="h-contenedor"><a  href="#" ><img class="absolute-align" src="images/logo.jpg" width="100" alt="" /></a>
      </div>
        <nav className="links">
          <ul>
            
          </ul>
        </nav>
        <nav className="main">
          <ul>
            <li className="search">
              <a className="search-link" href="#">
                <i className="fas fa-search"></i> Search
                </a>
              <form id="search" method="get" action="#">
                <input type="text" name="query" placeholder="Search" />
              </form>
            </li>

          </ul>
        </nav>
        {/*boton despegable*/}
        <BotonRs />
      </header>

      <div id="main">

        {/* Post */}
        <Cuerpoprincipal />
       

        {/* Post */}
        <Paginacion />


        {/* Pagination */}


      </div>

      {/* Sidebar */}
      <section id="sidebar">

        {/* Intro */}
        <Introduccion />

        {/* Mini Posts */}
        <section>
          <div className="mini-posts">

            {/* Mini Post */}
            <Minicuerpo />
           
            {/* Mini Post */}

            {/* Mini Post */}

            {/* Mini Post */}

          </div>
        </section>

        {/* Posts List */}



        {/* Footer */}
        <Piedepagina />

      </section>

    </div>

  );
}

export default InicioInmobiliaria;
