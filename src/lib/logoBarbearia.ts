/** A Jota Pê (a barbearia original, antes de virar multi-tenant) mantém a
 * própria logo. Toda barbearia nova usa a logo neutra da plataforma —
 * evita mostrar a marca de uma loja específica pra quem é de outra. */
export function getLogoBarbearia(slug: string | undefined): string {
  return slug === 'jota-pe' ? '/logo.jpg' : '/logo-plataforma.jpg'
}
