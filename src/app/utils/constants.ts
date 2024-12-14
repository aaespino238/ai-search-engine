export interface SearchQuery {
    query: string,
    description: string
}

export interface SmartProxyTaskStatusResponse {
    target: string;
    page_from: number;
    num_pages: number;
    geo: string;
    device_type: string;
    headless: boolean | null;
    parse: boolean;
    locale: string | null;
    domain: string;
    output_schema: string | null;
    created_at: string;
    id: string;
    status: string;
    content_encoding: string;
    updated_at: string;
    force_headers: boolean;
    force_cookies: boolean;
    google_results_language: string;
    google_safe_search: string | null;
    google_tbm: string | null;
    google_tbs: string | null;
    google_nfpr: string | null;
    headers_cookies_policy: boolean;
}

export interface SmartProxyBatchStatusResponse {
    id: number,
    queries: SmartProxyTaskStatusResponse[]
}

export interface SearchResults {
    results: ResultItem[];
}

export interface ResultItem {
    content: ContentDetails;
    headers: any;
    status_code: number;
    task_id: string;
    created_at: any
    updated_at: any
}

interface ContentDetails {
    url: string;
    page: number;
    results: SearchResultsDetails;
}

interface SearchResultsDetails {
    paid: any[];
    videos?: any;
    organic: OrganicResult[];
    knowledge?: any;
    instant_answers?: any[];
    related_searches?: any;
    related_questions?: any[];
}

interface InlineSitelink {
    url: string;
    title: string;
}

interface Sitelinks {
    inline?: InlineSitelink[];
}

export interface OrganicResult {
    pos: number;
    url: string;
    desc: string;
    title: string;
    images?: string[];
    sitelinks?: Sitelinks;
    url_shown: string;
    pos_overall: number;
}

export interface ResponseBlock {
    response: string;
    sources: Source[];
}

export interface Source {
    page_title: string;
    url: string;
    relevant_information: string;
}

