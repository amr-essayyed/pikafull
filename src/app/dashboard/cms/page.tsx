import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getFAQItems, getTestimonials, getGalleryImages } from "@/actions/queries"
import { FileText, MessageSquare, Image as ImageIcon, Star } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function CMSPage() {
  const t = await getTranslations("AdminDashboard")
  let faqItems: any[] = []
  let testimonials: any[] = []
  let gallery: any[] = []
  try {
    ;[faqItems, testimonials, gallery] = await Promise.all([
      getFAQItems(),
      getTestimonials(),
      getGalleryImages(),
    ])
  } catch { /* fallback */ }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('websiteContent')}</h1>
        <p className="text-muted-foreground">{t('manageWebsiteContent')}</p>
      </div>

      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faq" className="gap-2">
            <FileText className="h-4 w-4" /> {t('faq')} ({faqItems.length})
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-2">
            <MessageSquare className="h-4 w-4" /> {t('reviewsTab')} ({testimonials.length})
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="h-4 w-4" /> {t('galleryTab')} ({gallery.length})
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          {faqItems.length > 0 ? (
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                    <TableHead>{t('question')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('order')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-[400px]">{item.question}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.sort_order}</TableCell>
                      <TableCell>
                        <Badge className={item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"} variant="secondary">
                          {item.is_active ? t('active') : t('inactive')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="p-16 text-center text-muted-foreground">
                {t('noFaqItems')}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials">
          {testimonials.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testi: any) => (
                <Card key={testi.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{testi.customer_name}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: testi.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">&ldquo;{testi.content}&rdquo;</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>{testi.service_name}</span>
                      <Badge className={testi.is_featured ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"} variant="secondary">
                        {testi.is_featured ? t('featured') : t('hidden')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-16 text-center text-muted-foreground">
                {t('noTestimonials')}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          {gallery.length > 0 ? (
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                    <TableHead>{t('title')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('featured')}</TableHead>
                    <TableHead>{t('order')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gallery.map((img: any) => (
                    <TableRow key={img.id}>
                      <TableCell className="font-medium">{img.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{img.description}</TableCell>
                      <TableCell>
                        <Badge className={img.is_featured ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"} variant="secondary">
                          {img.is_featured ? t('yes') : t('no')}
                        </Badge>
                      </TableCell>
                      <TableCell>{img.sort_order}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="p-16 text-center text-muted-foreground">
                {t('noGalleryImages')}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
