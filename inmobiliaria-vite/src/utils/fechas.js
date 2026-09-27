// Meses completos entre dos fechas "YYYY-MM-DD" (las que da un <input type="date">), contando por
// calendario: de 3 de marzo a 3 de septiembre son 6 meses exactos; de 3 de marzo a 2 de septiembre
// son 5 (el ultimo mes no se completo).
export const mesesEnteros = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return null;
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T00:00:00`);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin <= inicio) return null;

    let meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
    if (fin.getDate() < inicio.getDate()) meses -= 1;
    return Math.max(meses, 0);
};
