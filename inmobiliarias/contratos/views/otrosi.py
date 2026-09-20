"""Otrosi de los contratos."""
from datetime import date, timedelta

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from contratos.models import contrato_local_vivienda, otroSi
from contratos.serializers import OtroSiSerializer


class OtroSiViewSet(viewsets.ModelViewSet):

    queryset = otroSi.objects.all()
    serializer_class = OtroSiSerializer


class ContratosArrendatariosOtrosi(APIView):
    """
    Obtiene contratos de un arrendatario que requieren firmar otrosí
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, arrendatario_id):
        try:
            # Buscar contratos donde el arrendatario no ha firmado el otrosí
            # Nota: Esto depende de tu modelo otroSi
            existe_contrato = otroSi.objects.filter(
                contrato__arrendatario_id_original=arrendatario_id,
                aceptaOtroSiArrendatario=False,
                aceptaOtroSi=True,
            ).exists()

            return Response({"existe_contrato": existe_contrato}, status=200)
            
        except Exception as e:
            print(f"Error en ContratosArrendatariosOtrosi: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContraArrendatariosOtrosi(APIView):
    """
    Obtiene lista de contratos que requieren otrosí
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, arrendatario_id):
        try:
            contratos = otroSi.objects.filter(
                contrato__arrendatario_id_original=arrendatario_id,
                aceptaOtroSiArrendatario=False,
                aceptaOtroSi=True,
            )

            if contratos.exists():
                serializer = OtroSiSerializer(contratos, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"message": "No se encontraron contratos que cumplan las condiciones."},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            print(f"Error en ContraArrendatariosOtrosi: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContraArrendatariosOtrosiFirmados(APIView):
    """
    Obtiene lista de contratos con otrosí ya firmados
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, arrendatario_id):
        try:
            contratos = otroSi.objects.filter(
                contrato__arrendatario_id_original=arrendatario_id,
                aceptaOtroSiArrendatario=True,
                aceptaOtroSi=True,
            )

            if contratos.exists():
                serializer = OtroSiSerializer(contratos, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"message": "No se encontraron contratos que cumplan las condiciones."},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            print(f"Error en ContraArrendatariosOtrosiFirmados: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContratosActivosOtrosi(APIView):
    """
    Verifica si hay contratos activos que requieren otrosí
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            hoy = date.today()
            
            existe_contrato = contrato_local_vivienda.objects.filter(
                contrato_Activo=True,
                otrosiGenerado=False,
                fechafinOtrosi__lte=hoy + timedelta(days=15),
            ).exists()

            return Response({"existe_contrato": existe_contrato})
            
        except Exception as e:
            print(f"Error en ContratosActivosOtrosi: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
