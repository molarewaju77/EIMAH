import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

export function FAQSection() {
  return (
    <section id="faq" className="container-eimah py-7 md:py-14">
      <div className="grid md:grid-cols-12 gap-0 md:gap-16">
        <div className="md:col-span-4">
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-balance">
            <span className="md:hidden">FAQ</span>
            <span className="hidden md:block">Frequently <br /> asked questions</span>
          </h2>
          <p className="hidden md:block mt-4 text-muted-foreground max-w-sm">
            Everything you need to know about shopping with EIMAH.
          </p>
          <a href="mailto:hello@eimah.co" className="hidden md:inline-flex mt-8 items-center gap-2 text-sm font-semibold border-b border-foreground pb-1">
            Still have questions? Contact us <ArrowRight className="size-4" />
          </a>
        </div>
        <div className="md:col-span-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
                <AccordionTrigger className="py-6 text-left font-display font-semibold text-lg md:text-xl hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed pb-6 max-w-2xl">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
