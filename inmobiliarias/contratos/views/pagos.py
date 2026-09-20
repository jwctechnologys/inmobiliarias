"""Fechas de pago y recibos de servicios."""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from contratos.models import FechaPago, ReportePagoRecibos, contrato_local_vivienda
from contratos.serializers import ReportePagoRecibosSerializer


class FechaPagoView(APIView):
    """
    Registra una fecha de pago para un contrato
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, contrato_id):
        try:
            fecha_pago = request.data.get("fecha_pago")
            fechadeMesaPagar = request.data.get("fechadeMesaPagar")
            
            if not fecha_pago:
                return Response(
                    {"error": "fecha_pago es requerido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            contrato = get_object_or_404(contrato_local_vivienda, id=contrato_id)
            
            nueva_fecha_pago = FechaPago.objects.create(
                contrato=contrato,
                fecha_pago=fecha_pago,
                fechadeMesaPagar=fechadeMesaPagar,
                estado_pago="REALIZADO",
            )
            
            return Response(
                {"mensaje": "Fecha de pago registrada correctamente"},
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            print(f"Error en FechaPagoView: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReportePagoRecibosView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        print("esto es user", user)
        # Verificar si el usuario es arrendatario
        if not user.groups.filter(name="arrendatario").exists():
            return Response(
                {"error": "No tiene permisos para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Identificar el tipo de recibo enviado
        recibo_tipo = request.data.get("reciboTipo")
        archivo = request.FILES.get(recibo_tipo)

        if not recibo_tipo or not archivo:
            return Response(
                {
                    "error": "Debe especificar el tipo de recibo y proporcionar un archivo."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Crear datos dinámicamente para el serializador
        data = {
            "reportePagoReciboContrato": request.data.get("reportePagoReciboContrato"),
            recibo_tipo: archivo,
        }

        serializer = ReportePagoRecibosSerializer(data=data)

        if serializer.is_valid():
            reporte = serializer.save()
            return Response(
                {
                    "message": f"El recibo de {recibo_tipo} se subió con éxito.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerPagosServiciosView(APIView):

    def get(self, request, arrendatario_id):
        # Obtener los contratos del arrendatario
        contratos = contrato_local_vivienda.objects.filter(
            arrendatario_id_original=arrendatario_id
        )

        # Si no hay contratos, retornar un mensaje adecuado
        if not contratos.exists():
            return Response(
                {"message": "Este arrendatario no tiene contratos registrados."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Obtener los pagos asociados a los contratos de este arrendatario
        pagos = ReportePagoRecibos.objects.filter(
            reportePagoReciboContrato__in=contratos
        )

        # Si no hay pagos asociados, retornar un mensaje adecuado
        if not pagos.exists():
            return Response(
                {
                    "message": "No se han encontrado pagos de servicios para este arrendatario."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serializar los pagos
        serializer = ReportePagoRecibosSerializer(pagos, many=True)
        print(serializer.data)

        return Response(serializer.data)
