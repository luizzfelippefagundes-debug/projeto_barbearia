'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from './Button'
import { Modal } from './Modal'

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject(new Error('Não foi possível carregar a imagem.')))
    img.src = src
  })
}

async function recortarImagem(imageSrc: string, area: Area, nomeArquivo: string): Promise<File> {
  const imagem = await carregarImagem(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = area.width
  canvas.height = area.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível recortar a imagem.')
  ctx.drawImage(imagem, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Não foi possível gerar a imagem recortada.'))
        resolve(new File([blob], nomeArquivo, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.92,
    )
  })
}

/** Modal de "enquadrar antes de subir" — abre com a foto recém-escolhida,
 * deixa arrastar/dar zoom num recorte quadrado (fica redondo pelo
 * cropShape, já que é sempre exibida como avatar), e só then gera o
 * arquivo final que efetivamente sobe. */
export function FotoCropModal({
  open,
  arquivo,
  onCancelar,
  onConfirmar,
}: {
  open: boolean
  arquivo: File | null
  onCancelar: () => void
  onConfirmar: (arquivoRecortado: File) => void
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [areaPixels, setAreaPixels] = useState<Area | null>(null)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    if (!arquivo) {
      setImageSrc(null)
      return
    }
    const url = URL.createObjectURL(arquivo)
    setImageSrc(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setAreaPixels(null)
    return () => URL.revokeObjectURL(url)
  }, [arquivo])

  async function handleConfirmar() {
    if (!imageSrc || !areaPixels || !arquivo) return
    setProcessando(true)
    try {
      const recortado = await recortarImagem(imageSrc, areaPixels, arquivo.name)
      onConfirmar(recortado)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <Modal open={open} onClose={onCancelar} title="Ajustar foto" widthClassName="max-w-sm">
      <div className="flex flex-col gap-4">
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-surface-raised">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area, pixels) => setAreaPixels(pixels)}
            />
          )}
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setZoom(Number(e.target.value))}
          className="w-full accent-accent"
          aria-label="Zoom da foto"
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={processando || !areaPixels}>
            {processando ? 'Salvando...' : 'Usar essa foto'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
