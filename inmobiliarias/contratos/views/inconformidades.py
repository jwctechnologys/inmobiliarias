"""Reportes de inconformidad."""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from contratos.models import ReporteInconformidad, contrato_local_vivienda
from contratos.serializers import ReporteInconformidadSerializer


class ReporteIndonformidadCreateView(APIView):
    def post(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)

        # Crear el serializer con los datos del request
        serializer = ReporteInconformidadSerializer(data=request.data)

        # Validar los datos
        if serializer.is_valid():
            try:
                # Guardar el reporte de inconformidad
                reporte = serializer.save()

                # Actualizar el estado del contrato relacionado
                contrato_id = reporte.reporteinconformidad.id
                contrato = get_object_or_404(contrato_local_vivienda, id=contrato_id)

                # Marcar que el contrato ya no está firmado
                contrato.estaFirmado = False
                contrato.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print("Error al guardar o actualizar los datos:", str(e))
                return Response(
                    {"detail": f"Error interno: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            # Mostrar errores específicos del serializer
            print("Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        # Obtener el ID del reporte de inconformidad desde la URL
        reporte_id = kwargs.get("pk")
        print(f"ID recibido en la URL: {reporte_id}")  # Control: Mostrar ID recibido

        # Buscar el reporte de inconformidad usando el ID
        try:
            reporte = get_object_or_404(ReporteInconformidad, id=reporte_id)
            print(
                f"Reporte encontrado: {reporte}"
            )  # Control: Mostrar objeto reporte encontrado
        except Exception as e:
            print(
                f"Error al obtener el reporte: {e}"
            )  # Control: Error al obtener reporte
            return Response(
                {"detail": "Reporte de inconformidad no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Actualizar el estado de la inconformidad como solucionada
        reporte.inconformidadSolucionada = True
        print(
            f"Estado de inconformidad antes de guardar: {reporte.inconformidadSolucionada}"
        )  # Control: Verificar estado antes de guardar

        # Guardar el reporte
        reporte.save()
        print(
            f"Estado de inconformidad después de guardar: {reporte.inconformidadSolucionada}"
        )  # Control: Verificar estado después de guardar

        # Responder con el mensaje de éxito
        return Response(
            {"detail": "Inconformidad marcada como solucionada"},
            status=status.HTTP_200_OK,
        )


class ReporteInconformidadCreateView(APIView):
    """
    Crea o actualiza un reporte de inconformidad
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)

        try:
            serializer = ReporteInconformidadSerializer(data=request.data)
            
            if serializer.is_valid():
                reporte = serializer.save()

                # Actualizar el estado del contrato
                contrato_id = reporte.reporteinconformidad.id
                contrato = get_object_or_404(contrato_local_vivienda, id=contrato_id)
                contrato.estaFirmado = False
                contrato.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print("Errores de validación:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Error en ReporteInconformidadCreateView: {e}")
            return Response(
                {"detail": f"Error interno: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, *args, **kwargs):
        reporte_id = kwargs.get("pk")
        
        try:
            reporte = get_object_or_404(ReporteInconformidad, id=reporte_id)
            reporte.inconformidadSolucionada = True
            reporte.save()
            
            return Response(
                {"detail": "Inconformidad marcada como solucionada"},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            print(f"Error en ReporteInconformidadCreateView.patch: {e}")
            return Response(
                {"detail": f"Error interno: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
