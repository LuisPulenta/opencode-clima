export async function pedirJson<T>(url: URL): Promise<T> {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`La API respondió con estado ${respuesta.status}`);
  }
  return (await respuesta.json()) as T;
}
