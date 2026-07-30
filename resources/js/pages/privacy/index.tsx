import LegalDocument, { type LegalSection } from '@/components/legal-document';

/**
 * Standard privacy content for the studio site. It matches what the site
 * actually does today (enquiry form, basic analytics) — have it reviewed by
 * counsel before launch. Kept free of studio contact details and revision
 * dates, which will come from the backend later.
 */
const sections: LegalSection[] = [
    {
        id: 'overview',
        title: 'Overview',
        blocks: [
            {
                type: 'text',
                text: 'Home Fashion Jamaleddine ("HFJE", "we", "us") designs and furnishes homes. This policy explains what personal information we collect through this website, why we collect it, and the choices you have over it.',
            },
            {
                type: 'text',
                text: 'By using this website or contacting the studio through it, you agree to the practices described here.',
            },
        ],
    },
    {
        id: 'information-we-collect',
        title: 'Information we collect',
        blocks: [
            {
                type: 'text',
                text: 'We only collect what we need to answer enquiries and run the site:',
            },
            {
                type: 'list',
                items: [
                    'Details you give us — your name, email address, phone number, and anything you write in an enquiry or send us about a project.',
                    'Project information — measurements, photographs, drawings, and preferences you share while we prepare a proposal.',
                    'Technical information — IP address, browser and device type, pages viewed, and referring site, collected automatically when you visit.',
                ],
            },
            {
                type: 'text',
                text: 'We do not ask for payment card details through this website, and we do not knowingly collect sensitive categories of personal data.',
            },
        ],
    },
    {
        id: 'how-we-use-it',
        title: 'How we use it',
        blocks: [
            {
                type: 'list',
                items: [
                    'To reply to your enquiry and prepare quotations or proposals.',
                    'To deliver a project you have commissioned, including ordering materials and scheduling installation.',
                    'To keep records of our work, correspondence, and agreements.',
                    'To maintain and improve the website and understand how it is used.',
                    'To send occasional studio updates, where you have asked to receive them.',
                ],
            },
            {
                type: 'text',
                text: 'We do not sell your personal information, and we do not share it for third-party advertising.',
            },
        ],
    },
    {
        id: 'cookies',
        title: 'Cookies and analytics',
        blocks: [
            {
                type: 'text',
                text: 'The website uses a small number of cookies and similar technologies. Essential cookies keep the site working and secure. Analytics cookies help us understand which pages are visited and how the site performs, in aggregate.',
            },
            {
                type: 'text',
                text: 'You can block or delete cookies in your browser settings. Blocking essential cookies may affect how parts of the site behave.',
            },
        ],
    },
    {
        id: 'sharing',
        title: 'Who we share it with',
        blocks: [
            {
                type: 'text',
                text: 'We share personal information only where it is needed to do our work, and only to the extent required:',
            },
            {
                type: 'list',
                items: [
                    'Service providers who host the site, deliver our email, or provide analytics on our behalf.',
                    'Suppliers, workshops, and installers involved in delivering your project.',
                    'Professional advisers, insurers, or authorities where we are required by law to disclose information.',
                ],
            },
            {
                type: 'text',
                text: 'These parties may process your information only on our instructions and are required to keep it confidential.',
            },
        ],
    },
    {
        id: 'retention',
        title: 'How long we keep it',
        blocks: [
            {
                type: 'text',
                text: 'We keep enquiry correspondence for as long as needed to respond and follow up. Project records are kept for the life of the project and for a further period afterwards to meet our accounting, warranty, and legal obligations. After that, information is deleted or anonymised.',
            },
        ],
    },
    {
        id: 'security',
        title: 'Security',
        blocks: [
            {
                type: 'text',
                text: 'We use reasonable technical and organisational measures to protect personal information against loss, misuse, and unauthorised access. No transmission over the internet is completely secure, so we cannot guarantee absolute security of information sent to us online.',
            },
        ],
    },
    {
        id: 'your-rights',
        title: 'Your rights',
        blocks: [
            {
                type: 'text',
                text: 'Subject to applicable law, you may ask us to:',
            },
            {
                type: 'list',
                items: [
                    'Confirm what personal information we hold about you and provide a copy.',
                    'Correct information that is inaccurate or incomplete.',
                    'Delete information we no longer need to keep.',
                    'Stop sending you studio updates — every message includes an unsubscribe link.',
                ],
            },
            {
                type: 'text',
                text: 'Contact the studio to make a request. We may need to verify your identity before we act on it.',
            },
        ],
    },
    {
        id: 'third-party-links',
        title: 'Links to other sites',
        blocks: [
            {
                type: 'text',
                text: 'The site links to social profiles and, occasionally, to partners and suppliers. We are not responsible for the content or privacy practices of sites we do not operate. Please read their policies before sharing information with them.',
            },
        ],
    },
    {
        id: 'children',
        title: "Children's privacy",
        blocks: [
            {
                type: 'text',
                text: 'This website is intended for adults. We do not knowingly collect personal information from children. If you believe a child has provided us with information, contact us and we will delete it.',
            },
        ],
    },
    {
        id: 'changes',
        title: 'Changes to this policy',
        blocks: [
            {
                type: 'text',
                text: 'We may update this policy as the studio, the website, or the law changes. The version published on this page is always the one that applies.',
            },
        ],
    },
    {
        id: 'contact',
        title: 'Contact us',
        blocks: [
            {
                type: 'text',
                text: 'If you have questions about this policy, or about the information we hold, get in touch with the studio through our contact page.',
            },
        ],
    },
];

export default function Privacy() {
    return (
        <LegalDocument
            title="Privacy Policy"
            intro="How Home Fashion Jamaleddine collects, uses, and protects the information you share with the studio."
            sections={sections}
        />
    );
}
