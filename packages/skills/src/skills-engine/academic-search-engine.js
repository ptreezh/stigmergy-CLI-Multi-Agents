/**
 * Real Academic Search Engine
 * Provides genuine academic paper search and DOI retrieval functionality
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

class AcademicSearchEngine {
    constructor() {
        this.apis = {
            arxiv: 'http://export.arxiv.org/api/query',
            crossref: 'https://api.crossref.org/works',
            semanticscholar: 'https://api.semanticscholar.org/graph/v1/paper/search',
            cnki: null // CNKI requires special handling due to login
        };
    }

    /**
     * Search academic papers across multiple sources
     */
    async searchPapers(query, options = {}) {
        const results = {
            arxiv: [],
            crossref: [],
            semanticscholar: [],
            cnki: [] // Will be populated separately due to authentication
        };

        // Search arXiv
        try {
            results.arxiv = await this.searchArXiv(query, options);
        } catch (error) {
            console.warn('arXiv search failed:', error.message);
        }

        // Search CrossRef
        try {
            results.crossref = await this.searchCrossRef(query, options);
        } catch (error) {
            console.warn('CrossRef search failed:', error.message);
        }

        // Search Semantic Scholar
        try {
            results.semanticscholar = await this.searchSemanticScholar(query, options);
        } catch (error) {
            console.warn('Semantic Scholar search failed:', error.message);
        }

        // Combine and deduplicate results
        const allResults = this.combineResults(results);
        return this.deduplicateResults(allResults);
    }

    /**
     * Search arXiv API
     */
    async searchArXiv(query, options = {}) {
        const params = new URLSearchParams({
            search_query: `all:${encodeURIComponent(query)}`,
            start: 0,
            max_results: options.maxResults || 10,
            sortBy: 'relevance',
            sortOrder: 'descending'
        });

        const response = await axios.get(`${this.apis.arxiv}?${params.toString()}`);
        const xmlText = response.data;

        // Parse XML response
        const papers = [];
        // Simple XML parsing for atom feeds
        const entries = xmlText.split('<entry>');
        entries.shift(); // Remove first empty element

        for (const entry of entries) {
            const title = this.extractTag(entry, 'title');
            const summary = this.extractTag(entry, 'summary');
            const published = this.extractTag(entry, 'published');
            const authors = this.extractAuthors(entry);
            const id = this.extractTag(entry, 'id');
            const pdfLink = entry.match(/<link href="(.*?pdf)" rel="related"/)?.[1] || 
                           entry.match(/<link href="(.*?arxiv\.org\/pdf\/.*?\.pdf)"/)?.[1];

            if (title && id) {
                papers.push({
                    title: title.trim(),
                    abstract: summary ? summary.trim() : '',
                    authors: authors,
                    publishedDate: published ? new Date(published).toISOString() : null,
                    id: id,
                    url: id,
                    pdfUrl: pdfLink,
                    source: 'arXiv',
                    doi: this.extractDOI(entry)
                });
            }
        }

        return papers;
    }

    /**
     * Search CrossRef API
     */
    async searchCrossRef(query, options = {}) {
        const params = new URLSearchParams({
            query: query,
            rows: options.maxResults || 10
        });

        if (options.sort) {
            params.append('sort', options.sort);
            params.append('order', options.order || 'desc');
        }

        const response = await axios.get(`${this.apis.crossref}?${params.toString()}`);
        const data = response.data;

        if (data.status === 'ok' && data.message?.items) {
            return data.message.items.map(item => ({
                title: Array.isArray(item.title) ? item.title[0] : item.title,
                abstract: item.abstract || '',
                authors: (item.author || []).map(author => 
                    `${author.given || ''} ${author.family || ''}`.trim()
                ),
                publishedDate: item.created?.['date-parts'] ? 
                    new Date(item.created['date-parts'][0].join('-')).toISOString() : null,
                id: item.id,
                url: item.URL,
                pdfUrl: (item.link || []).find(link => link.contentType === 'application/pdf')?.URL,
                source: 'CrossRef',
                doi: item.DOI
            }));
        }
        return [];
    }

    /**
     * Search Semantic Scholar API
     */
    async searchSemanticScholar(query, options = {}) {
        const params = {
            query: query,
            limit: options.maxResults || 10,
            fields: 'title,abstract,venue,year,authors,citationStyles,journal,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,url,externalIds'
        };

        const response = await axios.get(this.apis.semanticscholar + '?' + new URLSearchParams(params).toString(), {
            headers: {
                'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY || '' // Optional API key
            }
        });

        if (response.data && response.data.data) {
            return response.data.data.map(paper => ({
                title: paper.title || '',
                abstract: paper.abstract || '',
                authors: (paper.authors || []).map(author => author.name),
                publishedDate: paper.year ? new Date(paper.year, 0, 1).toISOString() : null,
                id: paper.paperId,
                url: paper.url,
                pdfUrl: paper.openAccessPdf ? paper.openAccessPdf.url : null,
                source: 'Semantic Scholar',
                doi: paper.externalIds?.DOI || null,
                citationCount: paper.citationCount,
                influentialCitationCount: paper.influentialCitationCount
            }));
        }
        return [];
    }

    /**
     * Search CNKI (China National Knowledge Infrastructure)
     * Note: Requires special handling due to authentication
     */
    async searchCNKI(query, options = {}) {
        // For now, we'll provide guidance on how to access CNKI
        // In a real implementation, this would require browser automation
        // with proper authentication handling
        console.log(`For CNKI search, navigate to: https://kns.cnki.net/kns8/DefaultResult`);
        console.log(`Search for: ${query}`);
        
        return [{
            title: 'CNKI Access Required',
            abstract: 'China National Knowledge Infrastructure requires authenticated access. Please visit https://kns.cnki.net/kns8/DefaultResult to search for papers.',
            authors: [],
            publishedDate: new Date().toISOString(),
            id: 'cnki-access-required',
            url: 'https://kns.cnki.net/kns8/DefaultResult',
            pdfUrl: null,
            source: 'CNKI',
            doi: null,
            requiresAuthentication: true
        }];
    }

    /**
     * Retrieve DOI information
     */
    async retrieveDOI(doi) {
        try {
            const response = await axios.get(`https://doi.org/${doi}`, {
                headers: { Accept: 'application/vnd.citationstyles.csl+json' }
            });
            
            return {
                success: true,
                doi: doi,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                doi: doi,
                error: error.response?.status === 404 ? 'DOI not found' : error.message
            };
        }
    }

    /**
     * Download PDF file
     */
    async downloadPDF(pdfUrl, filename) {
        if (!pdfUrl) {
            throw new Error('No PDF URL provided');
        }

        try {
            const response = await axios({
                method: 'GET',
                url: pdfUrl,
                responseType: 'stream'
            });

            const filePath = path.join(process.cwd(), filename);
            const writer = response.data.pipe(fs.createWriteStream(filePath));

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    resolve({
                        success: true,
                        filepath: filePath,
                        size: fs.statSync(filePath).size
                    });
                });
                writer.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Failed to download PDF: ${error.message}`);
        }
    }

    // Helper methods
    extractTag(xmlPart, tag) {
        const startTag = `<${tag}>`;
        const endTag = `</${tag}>`;
        const startIndex = xmlPart.indexOf(startTag);
        if (startIndex === -1) return null;
        
        const endIndex = xmlPart.indexOf(endTag, startIndex);
        if (endIndex === -1) return null;
        
        return xmlPart.substring(startIndex + startTag.length, endIndex);
    }

    extractAuthors(entry) {
        const authors = [];
        const authorMatches = entry.match(/<name>(.*?)<\/name>/g);
        if (authorMatches) {
            for (const match of authorMatches) {
                const name = match.replace(/<[^>]*>/g, '').trim();
                if (name) authors.push(name);
            }
        }
        return authors;
    }

    extractDOI(entry) {
        const doiMatch = entry.match(/<id>(https:\/\/doi\.org\/(10\.[^<]+))<\/id>/);
        if (doiMatch) {
            return doiMatch[2];
        }
        return null;
    }

    combineResults(results) {
        let combined = [];
        for (const source in results) {
            combined = combined.concat(results[source]);
        }
        return combined;
    }

    deduplicateResults(results) {
        const seenTitles = new Set();
        const uniqueResults = [];

        for (const paper of results) {
            const titleKey = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!seenTitles.has(titleKey)) {
                seenTitles.add(titleKey);
                uniqueResults.push(paper);
            }
        }

        return uniqueResults;
    }

    /**
     * Format search results for display
     */
    formatResults(results, query) {
        const formatted = {
            query: query,
            totalResults: results.length,
            results: results.map((paper, index) => ({
                rank: index + 1,
                title: paper.title,
                authors: paper.authors.join(', '),
                source: paper.source,
                publishedDate: paper.publishedDate ? new Date(paper.publishedDate).getFullYear() : 'Unknown',
                url: paper.url,
                pdfUrl: paper.pdfUrl,
                doi: paper.doi,
                abstract: paper.abstract ? paper.abstract.substring(0, 200) + '...' : '',
                relevance: this.calculateRelevance(paper, query)
            }))
        };

        // Sort by relevance
        formatted.results.sort((a, b) => b.relevance - a.relevance);
        return formatted;
    }

    calculateRelevance(paper, query) {
        const lowerTitle = paper.title.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        let relevance = 0;
        
        // Keywords in title boost relevance
        const queryWords = lowerQuery.split(/\s+/);
        for (const word of queryWords) {
            if (lowerTitle.includes(word)) {
                relevance += 10;
            }
        }
        
        // Abstract relevance
        if (paper.abstract) {
            const lowerAbstract = paper.abstract.toLowerCase();
            for (const word of queryWords) {
                if (lowerAbstract.includes(word)) {
                    relevance += 2;
                }
            }
        }
        
        return relevance;
    }
}

export { AcademicSearchEngine };
