import { Component } from '@angular/core';
import { CareerTimeline } from '../career/career-timeline';

@Component({
  selector: 'app-profile',
  imports: [CareerTimeline],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {}
