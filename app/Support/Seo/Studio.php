<?php

namespace App\Support\Seo;

/**
 * Who HFJE is, in the words every page's meta and graph share: the names it
 * goes by, when it started, what it does and where. Kept in one place so a
 * title, a description and the knowledge-graph entry can never disagree.
 */
final class Studio
{
    /** The short name, as it reads in a title. */
    public const string NAME = 'HFJE';

    public const string LEGAL_NAME = 'Home Fashion Jamaleddine';

    public const string ARABIC_NAME = 'هوم فاشن جمال الدين';

    public const string SLOGAN = 'Crafted Around Living';

    public const int FOUNDED = 1999;

    public const string COUNTRY = 'LB';

    public const string COUNTRY_NAME = 'Lebanon';

    /**
     * The one Open Graph image every page shares for now, at the size link
     * previews render from before the file has finished downloading.
     */
    public const string IMAGE = 'og/hfje.jpg';

    public const int IMAGE_WIDTH = 1200;

    public const int IMAGE_HEIGHT = 630;

    public const string IMAGE_ALT = 'The HFJE logo over a warm, terracotta-lit living room: Crafted Around Living';

    /** The square mark, for the logo in the knowledge graph. */
    public const string LOGO = 'web-app-manifest-512x512.png';

    /** What the studio does, one line, used wherever a page has nothing better to say. */
    public const string DESCRIPTION = 'HFJE (Home Fashion Jamaleddine) has shaped Lebanese homes since 1999: '
        .'interior design and furnishing, made-to-measure curtains and textiles, and BAYTÉ furniture.';

    /**
     * The searches the studio should be found for, in English and in Arabic,
     * the way people in Lebanon actually type them.
     */
    public const string KEYWORDS = 'HFJE, Home Fashion Jamaleddine, interior design Lebanon, interior designer Beirut, '
        .'home furnishing Lebanon, custom curtains Lebanon, curtains Beirut, made to measure curtains, '
        .'upholstery Lebanon, furniture Lebanon, BAYTÉ furniture, home decor Lebanon, '
        .'تصميم داخلي لبنان, ديكور منازل, برادي لبنان, ستائر لبنان, مفروشات لبنان, أثاث منزلي';

    /** The title for any page, with the studio's name after the page's own. */
    public static function title(string $page): string
    {
        return $page.' | '.self::NAME;
    }

    /** How many years the studio has been working, as of this year. */
    public static function years(): int
    {
        return (int) now()->year - self::FOUNDED;
    }
}
