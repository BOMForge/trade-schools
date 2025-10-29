# School Submission Form Improvements

## Overview
The school submission form has been completely redesigned with a comprehensive set of fields, better UX, and professional styling to make it easier for users to submit trade schools and programs to the directory.

## What's New

### Enhanced Form Fields

#### School Information Section
- **School or Institution Name** (required) - Official name with helpful placeholder
- **Street Address** (required) - Full street address for accurate geocoding
- **City** (required) - City location
- **State** (required) - Dropdown with all 50 states
- **ZIP Code** (required) - Auto-formatted (supports both 12345 and 12345-6789 formats)
- **Phone Number** (required) - Auto-formatted to (555) 123-4567 format
- **School Website** (optional) - URL validation
- **Contact Email** (required) - Main contact email for the school

#### Programs & Training Section
- **Programs Offered** (required, multi-select checkboxes):
  - Welding
  - HVAC
  - Electrical
  - Plumbing
  - Automotive
  - CNC/Machining
  - Construction
  - Carpentry
  - Diesel Mechanics
  - Aviation Maintenance
  - Medical/Dental
  - Cosmetology
  - Culinary Arts
  - IT/Cybersecurity
  - Maritime
  - Other (with text field for specification)

- **Additional Program Details** (optional) - 1000 character textarea with live character counter

#### Submitter Information Section
- **Your Name** (optional) - For follow-up questions
- **Your Email** (optional) - Only contacted if questions arise
- **Your Role** (optional) - Dropdown to identify relationship to school:
  - School Administrator
  - Faculty/Instructor
  - Student/Alumni
  - Industry Partner
  - Community Member
  - Other

### User Experience Improvements

1. **Auto-formatting**
   - Phone numbers automatically format as you type
   - ZIP codes auto-format with hyphen for extended codes
   - Clean, real-time formatting without disrupting user input

2. **Smart Validation**
   - Required fields clearly marked with red asterisk
   - Browser native validation for email and URL fields
   - Custom validation for at least one program selection
   - Pattern validation for ZIP codes

3. **Visual Feedback**
   - Success message displayed after submission
   - Error message for validation issues
   - Field hints explaining what information is needed
   - Character counter for long text fields
   - Conditional display of "Other Program" field

4. **Better Organization**
   - Form divided into logical sections with clear headers
   - Two-column layout for city/state and zip/phone
   - Checkbox grid layout for easy program selection
   - Mobile-responsive single column layout on small screens

5. **Professional Styling**
   - Dark theme matching the main application
   - Smooth transitions and hover states
   - Checkbox labels styled as interactive cards
   - Clear visual hierarchy with section dividers

### Navigation Improvements

**Contact Us Link Added**
- Green "Contact Us" button added to all main pages
- Direct mailto link to tom@bomforge.com
- Appears in banner alongside other navigation links
- Distinct styling to stand out from regular navigation

**Updated Pages:**
- `/submit-school.html`
- `/src/submit-school.html`
- `/clean-map.html`
- `/src/clean-map.html`
- `/index.html`
- `/src/index.html`

## Technical Details

### Form Submission Flow
1. User fills out form with comprehensive information
2. Client-side validation ensures required fields are complete
3. At least one program must be selected
4. Auto-formatting applied to phone and ZIP
5. Form data collected and structured
6. Saved to localStorage for potential admin dashboard integration
7. Email generated with formatted submission details
8. mailto: link opens user's email client
9. Success message displayed
10. Form resets for next submission

### Email Format
Structured email sent to tom@bomforge.com with:
- School Information (name, full address, contact details)
- Programs Offered (comma-separated list)
- Program Details (if provided)
- Submitter Information (if provided)
- Metadata (timestamp, user agent)

### Data Structure
All submissions are saved to localStorage in structured format:
```javascript
{
  schoolName: string,
  schoolAddress: string,
  schoolCity: string,
  schoolState: string,
  schoolZip: string,
  schoolPhone: string,
  schoolWebsite: string,
  schoolEmail: string,
  programs: string[],
  programOther: string,
  programDetails: string,
  submitterName: string,
  submitterEmail: string,
  submitterRole: string,
  timestamp: ISO string,
  userAgent: string
}
```

## Files Modified

1. `/submit-school.html` - Complete redesign with 15+ fields
2. `/src/submit-school.html` - Mirror copy for deployment
3. `/clean-map.html` - Added contact link and CSS
4. `/src/clean-map.html` - Mirror copy
5. `/index.html` - Added contact link and CSS
6. `/src/index.html` - Mirror copy

## Future Enhancements (Optional)

The form is ready for backend integration. When ready to implement:

1. **Enable Backend API** - Move `/functions-disabled/` to `/functions/`
2. **Configure reCAPTCHA** - Add spam protection
3. **Set up D1 Database** - Store submissions in Cloudflare D1
4. **Configure Email Service** - Use Resend or similar for automated emails
5. **Create Admin Dashboard** - Review and approve submissions

See `/SCHOOL_SUBMISSION_SETUP.md` for full backend setup instructions.

## Benefits

### For Users
- Clear, intuitive form layout
- Helpful hints and validation
- Professional appearance
- Mobile-friendly design
- Auto-formatting reduces errors

### For Administrators
- Comprehensive data collection
- Structured email format
- Easy to parse and review
- Ready for database integration
- Better quality submissions

### For the Platform
- More complete school information
- Better program categorization
- Easier geocoding with full addresses
- Professional user experience
- Scalable architecture

## Contact

For questions or assistance, contact: **tom@bomforge.com**

The "Contact Us" link is now prominently displayed in the navigation banner on all main pages.

---

*Last Updated: October 29, 2025*


