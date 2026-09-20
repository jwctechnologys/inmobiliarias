"""Carga de PDF de contratos y otrosi."""
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from contratos.models import contrato_local_vivienda, otroSi


class PDFUploadOtrosiView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        contrato_id = request.data.get("contratoId")
        otrosis = request.FILES.get("pdf_firmado")  # Archivo PDF

        # Depuración inicial
        print(f"Contrato ID recibido: {contrato_id}")
        if otrosis:
            print(f"Archivo recibido: {otrosis.name}, tamaño: {otrosis.size} bytes")
        else:
            print("Archivo no recibido correctamente en 'otrosi'")

        if not contrato_id or not otrosis:
            return Response(
                {"error": "Contrato ID o archivo no proporcionado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            contrato = otroSi.objects.get(id=contrato_id)
            print(f"Contrato OtroSi encontrado: ID={contrato.id}")

            # Cambiar 'inventario' por 'pdf_inventario'
            contrato.pdf_firmado = otrosis  # Asigna el archivo PDF
            print(f"Archivo antes de guardar: {contrato.pdf_firmado}")

            contrato.save()  # Guarda el contrato junto con el archivo
            print(f"Contrato después de guardar: {contrato}")
        except contrato_local_vivienda.DoesNotExist:
            print(f"No se encontró el contrato con ID={contrato_id}")
            return Response(
                {"error": "Contrato no encontrado"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error inesperado: {e}")
            return Response(
                {"error": f"Error inesperado: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "PDF subido exitosamente"}, status=status.HTTP_200_OK
        )


class PDFUploadView(APIView):
    """
    Sube el PDF de inventario para un contrato
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        contrato_id = request.data.get("contratoId")
        inventario = request.FILES.get("inventario")

        if not contrato_id or not inventario:
            return Response(
                {"error": "Contrato ID o archivo no proporcionado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            contrato = contrato_local_vivienda.objects.get(id=contrato_id)
            contrato.pdf_inventario = inventario
            contrato.save()
            
            return Response(
                {"message": "PDF subido exitosamente"},
                status=status.HTTP_200_OK
            )
            
        except contrato_local_vivienda.DoesNotExist:
            return Response(
                {"error": "Contrato no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error en PDFUploadView: {e}")
            return Response(
                {"error": f"Error inesperado: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PDFUploadContratoView(APIView):
    """
    Sube el PDF del contrato firmado
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        contrato_id = request.data.get("contratoId")
        pdf_firmado = request.FILES.get("pdf_firmado")

        if not contrato_id or not pdf_firmado:
            return Response(
                {"error": "Contrato ID o archivo no proporcionado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            contrato = contrato_local_vivienda.objects.get(id=contrato_id)
            contrato.pdf_firmado = pdf_firmado
            contrato.save()
            
            return Response(
                {"message": "PDF subido exitosamente"},
                status=status.HTTP_200_OK
            )
            
        except contrato_local_vivienda.DoesNotExist:
            return Response(
                {"error": "Contrato no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error en PDFUploadContratoView: {e}")
            return Response(
                {"error": f"Error inesperado: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
