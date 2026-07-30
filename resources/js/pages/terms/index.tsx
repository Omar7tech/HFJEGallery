import LegalDocument, { type LegalSection } from '@/components/legal-document';

/**
 * Standard website terms for the studio site. Governing law should be
 * confirmed with counsel before launch. Kept free of studio contact details
 * and revision dates, which will come from the backend later.
 */
const sections: LegalSection[] = [
    {
        id: 'acceptance',
        title: 'Acceptance of these terms',
        blocks: [
            {
                type: 'text',
                text: 'These terms govern your use of the Home Fashion Jamaleddine ("HFJE", "we", "us") website. By browsing the site or sending us an enquiry, you accept them. If you do not agree with them, please do not use the site.',
            },
        ],
    },
    {
        id: 'use-of-site',
        title: 'Using the site',
        blocks: [
            {
                type: 'text',
                text: 'You may use this website for personal, non-commercial purposes and to enquire about our services. You agree not to:',
            },
            {
                type: 'list',
                items: [
                    'Copy, republish, or resell any part of the site without our written permission.',
                    'Attempt to gain unauthorised access to the site, its servers, or connected systems.',
                    'Introduce malicious code, or use automated tools to scrape or overload the site.',
                    'Use the site in any way that breaks applicable law or infringes the rights of others.',
                ],
            },
        ],
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual property',
        blocks: [
            {
                type: 'text',
                text: 'The HFJE name, logo, designs, photographs, drawings, text, and the arrangement of this site are owned by us or used under licence, and are protected by copyright and trade mark law.',
            },
            {
                type: 'text',
                text: 'You may view and print pages for your own reference. Any other use — including reproduction, adaptation, or commercial use of our imagery or designs — requires our prior written consent.',
            },
        ],
    },
    {
        id: 'project-imagery',
        title: 'Project imagery and descriptions',
        blocks: [
            {
                type: 'text',
                text: 'Project photographs and descriptions on this site illustrate completed and representative work. Colours, textures, and finishes are shown as accurately as the medium allows, but screens vary and natural materials differ between batches.',
            },
            {
                type: 'text',
                text: 'Nothing shown here is a guarantee that an identical result can be reproduced. Material samples are the reference for any commissioned work.',
            },
        ],
    },
    {
        id: 'enquiries-and-quotations',
        title: 'Enquiries and quotations',
        blocks: [
            {
                type: 'text',
                text: 'Information on this site is an invitation to enquire, not a binding offer. Prices, lead times, and availability are confirmed only in a written quotation issued by the studio.',
            },
            {
                type: 'text',
                text: 'Commissioned work is governed by the separate agreement or proposal you sign with us. Where those documents conflict with these terms, the signed agreement prevails for that project.',
            },
        ],
    },
    {
        id: 'your-submissions',
        title: 'What you send us',
        blocks: [
            {
                type: 'text',
                text: 'When you send us plans, photographs, or other material, you confirm you have the right to share it and that it does not infringe anyone else’s rights. You grant us permission to use it for the purpose of assessing and delivering your enquiry or project.',
            },
            {
                type: 'text',
                text: 'We handle everything you send in line with our Privacy Policy.',
            },
        ],
    },
    {
        id: 'availability',
        title: 'Site availability',
        blocks: [
            {
                type: 'text',
                text: 'We aim to keep the site available and up to date, but we may change, suspend, or withdraw any part of it at any time without notice. We are not liable if the site is unavailable for any period.',
            },
        ],
    },
    {
        id: 'external-links',
        title: 'External links',
        blocks: [
            {
                type: 'text',
                text: 'Links to third-party sites are provided for convenience. We do not control those sites, do not endorse their content, and accept no responsibility for them.',
            },
        ],
    },
    {
        id: 'disclaimer',
        title: 'Disclaimer',
        blocks: [
            {
                type: 'text',
                text: 'The site and its content are provided "as is". While we take care to keep information accurate, we make no warranties that it is complete, current, or fit for a particular purpose. Content on this site is not professional advice for a specific space or project.',
            },
        ],
    },
    {
        id: 'liability',
        title: 'Limitation of liability',
        blocks: [
            {
                type: 'text',
                text: 'To the fullest extent permitted by law, we are not liable for any indirect or consequential loss, or for loss of profit, business, or data, arising from your use of this website.',
            },
            {
                type: 'text',
                text: 'Nothing in these terms limits liability that cannot be excluded under applicable law, including for death or personal injury caused by negligence or for fraud.',
            },
        ],
    },
    {
        id: 'governing-law',
        title: 'Governing law',
        blocks: [
            {
                type: 'text',
                text: 'These terms are governed by the laws of the Republic of Lebanon, and the courts of Beirut have exclusive jurisdiction over any dispute arising from them or from your use of this website.',
            },
        ],
    },
    {
        id: 'changes',
        title: 'Changes to these terms',
        blocks: [
            {
                type: 'text',
                text: 'We may revise these terms from time to time. The version published on this page is the one that applies to your use of the site.',
            },
        ],
    },
    {
        id: 'contact',
        title: 'Contact us',
        blocks: [
            {
                type: 'text',
                text: 'If you have questions about these terms, get in touch with the studio through our contact page.',
            },
        ],
    },
];

export default function Terms() {
    return (
        <LegalDocument
            title="Terms of Use"
            intro="The terms that apply when you browse this website or send an enquiry to the studio."
            sections={sections}
        />
    );
}
