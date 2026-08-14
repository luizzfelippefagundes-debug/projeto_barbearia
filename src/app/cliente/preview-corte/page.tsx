import { AiHaircutPreviewClient } from '../../../components/preview/AiHaircutPreviewClient'
import { getServicosAtivos } from '../../../db/queries/servicos'

export default async function PreviewCortePage() {
  const servicos = await getServicosAtivos()
  return <AiHaircutPreviewClient servicos={servicos} />
}
