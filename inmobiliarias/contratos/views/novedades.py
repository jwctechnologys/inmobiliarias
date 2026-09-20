"""Reportes de novedades de la vivienda."""
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from contratos.models import (
    imagenReporteNovedades,
    reporteNovedades,
    videoReporteNovedades,
)
from contratos.serializers import ReporteNovedadesSerializer


class ReporteNovedadesCreateView(APIView):

    def post(self, request):
        serializer = ReporteNovedadesSerializer(data=request.data)
        print(serializer)
        if serializer.is_valid():
            reporte = serializer.save()

            # Manejar imágenes
            imagenes = request.FILES.getlist("imagenes")
            for imagen in imagenes:
                imagenReporteNovedades.objects.create(
                    reporteNovedad=reporte, imagen=imagen
                )

            # Manejar videos
            videos = request.FILES.getlist("videos")
            for video in videos:
                videoReporteNovedades.objects.create(
                    reporteNovedad=reporte, video_archivo=video
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReporteNovedadesListView(APIView):
    def get(self, request, *args, **kwargs):
        arrendatario_id = request.query_params.get(
            "arrendatario_id"
        )  # Obtener el ID del arrendatario de los parámetros de consulta

        if arrendatario_id:
            # Filtrar reportes por arrendatario a través de la relación con contratoNum y userArrendatario
            reportes = reporteNovedades.objects.filter(
                contratoNum__userArrendatario__id=arrendatario_id
            )
            if not reportes.exists():
                raise NotFound("No se encontraron reportes para este arrendatario.")
        else:
            # Obtener todos los reportes si no se envía el parámetro
            reportes = reporteNovedades.objects.all()

        serializer = ReporteNovedadesSerializer(reportes, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = ReporteNovedadesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnviarReporteView(APIView):
    def patch(self, request, reporte_id):
        try:
            reporte = reporteNovedades.objects.get(id=reporte_id)
            autorizacion = request.data.get("autorizacion")
            comentario = request.data.get("comentario")
            estaResuelto = request.data.get("estaResuelto")
            estaResueltoArrendatario = request.data.get("estaResueltoArrendatario")

            if autorizacion is not None:
                reporte.estaHabilitado = autorizacion
            if comentario:
                reporte.textoAdministrador = comentario
            if estaResuelto:
                reporte.estaResuelto = estaResuelto
            if estaResueltoArrendatario:
                reporte.estaResueltoArrendatario = estaResueltoArrendatario

            reporte.save()
            return Response(
                {"message": "Reporte actualizado exitosamente."},
                status=status.HTTP_200_OK,
            )

        except reporteNovedades.DoesNotExist:
            return Response(
                {"error": "Reporte no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )
