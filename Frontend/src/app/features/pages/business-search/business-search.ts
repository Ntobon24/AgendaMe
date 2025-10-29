import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessService } from '../../../shared/services/business.service';
import { SearchService } from '../../../shared/services/search.service';
import { TagService } from '../../../shared/services/tag.service';
import { Business } from '../../../shared/interfaces/business';
import { Tag } from '../../../shared/interfaces/tag';

@Component({
  selector: 'app-business-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-search.html',
  styleUrls: ['./business-search.css']
})
export class BusinessSearchComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private businessService = inject(BusinessService);
  private searchService = inject(SearchService);
  private tagService = inject(TagService);

  searchForm: FormGroup;
  businesses = signal<Business[]>([]);
  availableTags = signal<Tag[]>([]);
  selectedTags = signal<string[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  constructor() {
    this.searchForm = this.fb.group({
      query: [''],
      location: [''],
      tags: ['']
    });

    this.loadBusinesses();
    this.loadTags();
  }

  async loadBusinesses() {
    this.isLoading.set(true);
    try {
      const businesses = await this.businessService.getAllBusinesses().toPromise();
      this.businesses.set(businesses || []);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadTags() {
    try {
      const tags = await this.tagService.getAllTags().toPromise();
      const activeTags = (tags || []).filter(tag => tag.is_active);
      this.availableTags.set(activeTags);
    } catch (error) {
    }
  }

  async onSearch() {
    this.isLoading.set(true);
    this.searchQuery.set(this.searchForm.get('query')?.value || '');
    
    try {
      const searchParams = {
        q: this.searchForm.get('query')?.value,
        location: this.searchForm.get('location')?.value,
        tags: this.selectedTags().join(',')
      };

      const result = await this.searchService.searchBusinesses(searchParams).toPromise();
      this.businesses.set(result?.businesses || []);
    } catch (error) {
      this.performLocalSearch();
    } finally {
      this.isLoading.set(false);
    }
  }

  performLocalSearch() {
    const query = this.searchForm.get('query')?.value?.toLowerCase() || '';
    const location = this.searchForm.get('location')?.value?.toLowerCase() || '';
    const selectedTags = this.selectedTags();

    let filteredBusinesses = [...this.businesses()];

    if (query) {
      filteredBusinesses = filteredBusinesses.filter(business =>
        business.name.toLowerCase().includes(query) ||
        business.description?.toLowerCase().includes(query)
      );
    }

    if (location) {
      filteredBusinesses = filteredBusinesses.filter(business =>
        business.address?.toLowerCase().includes(location)
      );
    }

    if (selectedTags.length > 0) {
      filteredBusinesses = filteredBusinesses.filter(business =>
        business.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    this.businesses.set(filteredBusinesses);
  }

  toggleTag(tagName: string) {
    const currentTags = this.selectedTags();
    if (currentTags.includes(tagName)) {
      this.selectedTags.set(currentTags.filter(tag => tag !== tagName));
    } else {
      this.selectedTags.set([...currentTags, tagName]);
    }
    this.onSearch();
  }

  clearFilters() {
    this.searchForm.reset();
    this.selectedTags.set([]);
    this.loadBusinesses();
  }

  viewBusiness(businessId: string) {
    this.router.navigate(['/business', businessId]);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
