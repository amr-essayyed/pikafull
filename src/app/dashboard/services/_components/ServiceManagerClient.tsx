"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Clock, Tag, MoreVertical, Plus, Edit, Power, PowerOff, Upload, Loader2, Image as ImageIcon, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  createService, updateService, toggleServiceStatus, 
  createExtraService, updateExtraService, toggleExtraServiceStatus,
  uploadServicePhoto
} from "@/actions/services"
import { BeforeAfterSlider } from "@/components/ui/before-after-slider"
import { getServicePhotos } from "@/lib/constants/service-photos"

async function compressImage(file: File, maxDimension = 1600, quality = 0.85): Promise<File> {
  if (file.type === "image/svg+xml" || file.size < 300 * 1024) {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          "image/jpeg",
          quality
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

export default function ServiceManagerClient({ initialServices, initialExtras }: { initialServices: any[], initialExtras: any[] }) {
  const t = useTranslations("AdminDashboard")
  const tCommon = useTranslations("Common")
  const [isPending, startTransition] = useTransition()

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [beforeUrl, setBeforeUrl] = useState("")
  const [afterUrl, setAfterUrl] = useState("")
  const [isUploadingBefore, setIsUploadingBefore] = useState(false)
  const [isUploadingAfter, setIsUploadingAfter] = useState(false)

  // Extra Modal State
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false)
  const [editingExtra, setEditingExtra] = useState<any>(null)

  const openNewService = () => {
    setEditingService(null)
    setBeforeUrl("")
    setAfterUrl("")
    setIsServiceModalOpen(true)
  }

  const openEditService = (service: any) => {
    setEditingService(service)
    setBeforeUrl(service.before_image_url || "")
    setAfterUrl(service.after_image_url || "")
    setIsServiceModalOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    if (type === "before") setIsUploadingBefore(true)
    else setIsUploadingAfter(true)

    try {
      const fileToUpload = await compressImage(rawFile)
      const formData = new FormData()
      formData.append("file", fileToUpload)
      const url = await uploadServicePhoto(formData)
      if (type === "before") setBeforeUrl(url)
      else setAfterUrl(url)
    } catch (err) {
      console.error("Failed to upload image", err)
    } finally {
      if (type === "before") setIsUploadingBefore(false)
      else setIsUploadingAfter(false)
    }
  }

  const openNewExtra = () => {
    setEditingExtra(null)
    setIsExtraModalOpen(true)
  }

  const openEditExtra = (extra: any) => {
    setEditingExtra(extra)
    setIsExtraModalOpen(true)
  }

  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      short_description: formData.get("short_description") as string,
      description: formData.get("description") as string,
      base_price: Number(formData.get("base_price")),
      duration_minutes: Number(formData.get("duration_minutes")),
      before_image_url: formData.get("before_image_url") as string,
      after_image_url: formData.get("after_image_url") as string,
    }

    startTransition(async () => {
      try {
        if (editingService) {
          await updateService(editingService.id, data)
        } else {
          await createService(data)
        }
        setIsServiceModalOpen(false)
      } catch (err) {
        console.error(err)
      }
    })
  }

  const handleExtraSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      duration_minutes: Number(formData.get("duration_minutes"))
    }

    startTransition(async () => {
      try {
        if (editingExtra) {
          await updateExtraService(editingExtra.id, data)
        } else {
          await createExtraService(data)
        }
        setIsExtraModalOpen(false)
      } catch (err) {
        console.error(err)
      }
    })
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('servicesPricing')}</h1>
        <p className="text-muted-foreground">{t('configureServices')}</p>
      </div>

      {/* Main Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t('mainServices', { count: initialServices.length })}</h2>
          <Button onClick={openNewService} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('addService')}
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialServices.map((s: any) => {
            const photos = getServicePhotos(s)
            return (
              <Card key={s.id} className={`hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between ${!s.is_active ? "opacity-75" : ""}`}>
                <div>
                  {/* Photo Comparison Thumbnail */}
                  <div className="p-2 pb-0">
                    <BeforeAfterSlider
                      beforeImage={photos.before}
                      afterImage={photos.after}
                      alt={s.name}
                      aspectRatio="aspect-[16/10]"
                      beforeLabel="Before"
                      afterLabel="After"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${s.is_active ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <h3 className="font-bold text-base leading-tight">{s.name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className={s.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500"}>
                          {s.is_active ? t('active') : t('inactive')}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditService(s)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('editService')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => startTransition(() => toggleServiceStatus(s.id, !s.is_active))}
                            >
                              {s.is_active ? (
                                <><PowerOff className="h-4 w-4 mr-2 text-red-500" /> {t('deactivate')}</>
                              ) : (
                                <><Power className="h-4 w-4 mr-2 text-emerald-500" /> {t('activate')}</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.short_description}</p>
                  </CardContent>
                </div>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between pt-2 border-t text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.floor((s.duration_minutes || 120) / 60)}h {(s.duration_minutes || 120) % 60 > 0 ? `${s.duration_minutes % 60}m` : ""}
                    </div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">£{Number(s.base_price).toFixed(0)}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Extra Services */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t('addOnServices', { count: initialExtras.length })}</h2>
          <Button onClick={openNewExtra} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('addExtraService')}
          </Button>
        </div>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {initialExtras.map((e: any) => (
            <Card key={e.id} className={!e.is_active ? "opacity-75" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{e.name}</p>
                    {!e.is_active && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{t('inactive')}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> {e.duration_minutes}min
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-600 text-sm">+£{Number(e.price).toFixed(0)}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditExtra(e)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('editExtraService')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => startTransition(() => toggleExtraServiceStatus(e.id, !e.is_active))}
                      >
                        {e.is_active ? (
                          <><PowerOff className="h-4 w-4 mr-2 text-red-500" /> {t('deactivate')}</>
                        ) : (
                          <><Power className="h-4 w-4 mr-2 text-emerald-500" /> {t('activate')}</>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {initialServices.length === 0 && initialExtras.length === 0 && (
        <div className="border rounded-xl p-16 text-center">
          <Tag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold mb-2">{t('noServicesConfiguredTitle')}</h3>
          <p className="text-muted-foreground">{t('noServicesConfiguredDesc')}</p>
        </div>
      )}

      {/* Service Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleServiceSubmit}>
            <DialogHeader>
              <DialogTitle>{editingService ? t('editService') : t('addService')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('serviceName')}</Label>
                <Input id="name" name="name" defaultValue={editingService?.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">{t('serviceSlug')}</Label>
                <Input id="slug" name="slug" defaultValue={editingService?.slug} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="short_description">{t('shortDescription')}</Label>
                <Input id="short_description" name="short_description" defaultValue={editingService?.short_description} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea id="description" name="description" defaultValue={editingService?.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="base_price">{t('basePrice')}</Label>
                  <Input id="base_price" name="base_price" type="number" min="0" step="0.01" defaultValue={editingService?.base_price} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration_minutes">{t('durationMinutes')}</Label>
                  <Input id="duration_minutes" name="duration_minutes" type="number" min="1" defaultValue={editingService?.duration_minutes} required />
                </div>
              </div>

              {/* Before Photo Upload */}
              <div className="grid gap-2 p-3 border border-border/60 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="before_image_url" className="font-semibold text-sm flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-amber-500" />
                    Before Photo
                  </Label>
                  <label htmlFor="before_file_input">
                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5 cursor-pointer" disabled={isUploadingBefore} asChild>
                      <span>
                        {isUploadingBefore ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {isUploadingBefore ? "Uploading..." : "Upload Photo"}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="before_file_input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "before")}
                  />
                </div>

                {beforeUrl && (
                  <div className="relative h-28 w-full rounded-md overflow-hidden border border-border group mt-1">
                    <img src={beforeUrl} alt="Before preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setBeforeUrl("")}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <Input
                  id="before_image_url"
                  name="before_image_url"
                  value={beforeUrl}
                  onChange={(e) => setBeforeUrl(e.target.value)}
                  placeholder="https://... or upload photo above"
                  className="text-xs"
                />
              </div>

              {/* After Photo Upload */}
              <div className="grid gap-2 p-3 border border-border/60 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="after_image_url" className="font-semibold text-sm flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-emerald-500" />
                    After Photo
                  </Label>
                  <label htmlFor="after_file_input">
                    <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5 cursor-pointer" disabled={isUploadingAfter} asChild>
                      <span>
                        {isUploadingAfter ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {isUploadingAfter ? "Uploading..." : "Upload Photo"}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="after_file_input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "after")}
                  />
                </div>

                {afterUrl && (
                  <div className="relative h-28 w-full rounded-md overflow-hidden border border-border group mt-1">
                    <img src={afterUrl} alt="After preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAfterUrl("")}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <Input
                  id="after_image_url"
                  name="after_image_url"
                  value={afterUrl}
                  onChange={(e) => setAfterUrl(e.target.value)}
                  placeholder="https://... or upload photo above"
                  className="text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsServiceModalOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isPending || isUploadingBefore || isUploadingAfter}>
                {tCommon('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extra Service Modal */}
      <Dialog open={isExtraModalOpen} onOpenChange={setIsExtraModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleExtraSubmit}>
            <DialogHeader>
              <DialogTitle>{editingExtra ? t('editExtraService') : t('addExtraService')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="extra_name">{t('serviceName')}</Label>
                <Input id="extra_name" name="name" defaultValue={editingExtra?.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="extra_description">{t('description')}</Label>
                <Textarea id="extra_description" name="description" defaultValue={editingExtra?.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="extra_price">{t('extraPrice')}</Label>
                  <Input id="extra_price" name="price" type="number" min="0" step="0.01" defaultValue={editingExtra?.price} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="extra_duration_minutes">{t('durationMinutes')}</Label>
                  <Input id="extra_duration_minutes" name="duration_minutes" type="number" min="1" defaultValue={editingExtra?.duration_minutes} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsExtraModalOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>{tCommon('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
