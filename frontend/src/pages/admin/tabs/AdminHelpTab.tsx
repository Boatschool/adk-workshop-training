/**
 * Admin Help Tab
 * User guides for administrators to manage content on the platform
 */

import { useState } from 'react'
import { cn } from '@utils/cn'

// Help section data structure
interface HelpSection {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

// Reusable components for help content
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
      {children}
    </h3>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mt-6 mb-2">
      {children}
    </h4>
  )
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
      {children}
    </p>
  )
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4 ml-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

function NumberedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4 ml-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  )
}

function FieldTable({ fields }: { fields: { name: string; required: boolean; description: string }[] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Field</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Required</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {fields.map((field) => (
            <tr key={field.name}>
              <td className="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {field.name}
              </td>
              <td className="px-4 py-2">
                {field.required ? (
                  <span className="text-red-600 dark:text-red-400">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </td>
              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{field.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-blue-800 dark:text-blue-200 text-sm">{children}</span>
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
      <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="text-amber-800 dark:text-amber-200 text-sm">{children}</span>
    </div>
  )
}

// Help content sections
const helpSections: HelpSection[] = [
  {
    id: 'overview',
    title: 'Getting Started',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    content: (
      <>
        <SectionHeading>Welcome to the Admin Console</SectionHeading>
        <Paragraph>
          The Admin Console provides a centralized interface for managing all aspects of your platform,
          including users, content, and organization settings. This guide will help you understand how
          to effectively manage and maintain your platform content.
        </Paragraph>

        <SubHeading>Available Admin Tabs</SubHeading>
        <BulletList items={[
          <><strong>Dashboard</strong> - View platform statistics, health status, and quick actions (Super Admin only)</>,
          <><strong>Users</strong> - Manage user accounts, roles, and permissions</>,
          <><strong>Organizations</strong> - Manage tenant organizations and their settings (Super Admin only)</>,
          <><strong>Guides</strong> - Create and manage documentation and guides (Super Admin only)</>,
          <><strong>Library</strong> - Manage learning resources including articles, videos, and PDFs (Super Admin only)</>,
          <><strong>What's New</strong> - Create announcements that appear on the user dashboard (Super Admin only)</>,
        ]} />

        <SubHeading>Role-Based Access</SubHeading>
        <Paragraph>
          Access to admin features is determined by your user role:
        </Paragraph>
        <BulletList items={[
          <><strong>Tenant Admin</strong> - Can manage users within their organization</>,
          <><strong>Super Admin</strong> - Full access to all admin features across all organizations</>,
        ]} />

        <Tip>
          Use the tab navigation at the top of the Admin Console to switch between different management areas.
        </Tip>
      </>
    ),
  },
  {
    id: 'users',
    title: 'User Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    content: (
      <>
        <SectionHeading>Managing Users</SectionHeading>
        <Paragraph>
          The Users tab allows you to create, edit, and manage user accounts within your organization.
          You can control user access by assigning roles and activating/deactivating accounts.
        </Paragraph>

        <SubHeading>Creating a New User</SubHeading>
        <NumberedList items={[
          'Click the "Add User" button in the top right corner',
          'Fill in the user details in the form that appears',
          'Select the appropriate role for the user',
          'Click "Create User" to save',
        ]} />

        <FieldTable fields={[
          { name: 'Email', required: true, description: 'The user\'s email address (used for login)' },
          { name: 'Full Name', required: false, description: 'The user\'s display name' },
          { name: 'Password', required: true, description: 'Must be at least 8 characters' },
          { name: 'Role', required: true, description: 'Participant, Instructor, or Tenant Admin' },
        ]} />

        <SubHeading>User Roles Explained</SubHeading>
        <BulletList items={[
          <><strong>Participant</strong> - Basic user who can access workshops and learning content</>,
          <><strong>Instructor</strong> - Can create and manage workshops, view participant progress</>,
          <><strong>Tenant Admin</strong> - Can manage all users within the organization</>,
        ]} />

        <SubHeading>Editing a User</SubHeading>
        <NumberedList items={[
          'Find the user in the table (use search if needed)',
          'Click the edit icon (pencil) in the actions column',
          'Update the user details as needed',
          'Toggle "Active" to enable or disable the account',
          'Click "Update User" to save changes',
        ]} />

        <SubHeading>Bulk Actions</SubHeading>
        <Paragraph>
          You can perform actions on multiple users at once:
        </Paragraph>
        <NumberedList items={[
          'Select users using the checkboxes in the table',
          'A bulk actions bar will appear above the table',
          'Choose "Activate" or "Deactivate" to change status for all selected users',
        ]} />

        <Warning>
          Deactivating a user will immediately prevent them from logging in. They will not lose any data,
          and can be reactivated at any time.
        </Warning>

        <SubHeading>Searching and Filtering</SubHeading>
        <BulletList items={[
          'Use the search box to find users by email or name',
          'Use the status dropdown to filter by active/inactive users',
          'Click column headers to sort the table',
        ]} />
      </>
    ),
  },
  {
    id: 'organizations',
    title: 'Organizations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    content: (
      <>
        <SectionHeading>Managing Organizations</SectionHeading>
        <Paragraph>
          Organizations (also called tenants) are isolated environments for different clients or teams.
          Each organization has its own users, data, and settings that are completely separate from other organizations.
        </Paragraph>

        <SubHeading>Creating an Organization</SubHeading>
        <NumberedList items={[
          'Click "Add Organization" in the top right corner',
          'Enter the organization name (this auto-generates a URL-friendly slug)',
          'Optionally add a Google API Key for ADK agent execution',
          'Select the subscription tier',
          'Click "Create Organization" to provision the new tenant',
        ]} />

        <FieldTable fields={[
          { name: 'Name', required: true, description: 'The display name of the organization' },
          { name: 'Slug', required: true, description: 'URL-friendly identifier (lowercase, numbers, hyphens only)' },
          { name: 'Google API Key', required: false, description: 'Required for running ADK agents' },
          { name: 'Subscription Tier', required: true, description: 'Trial, Basic, Pro, or Enterprise' },
        ]} />

        <Tip>
          The slug is used to create a unique database schema for the organization. Once created, the slug
          cannot be changed.
        </Tip>

        <SubHeading>Organization Status</SubHeading>
        <BulletList items={[
          <><strong>Active</strong> - Organization is fully operational</>,
          <><strong>Trial</strong> - Organization is in trial period</>,
          <><strong>Inactive</strong> - Organization is disabled but data is preserved</>,
          <><strong>Suspended</strong> - Organization access is restricted (e.g., for non-payment)</>,
        ]} />

        <SubHeading>Editing an Organization</SubHeading>
        <Paragraph>
          Click the edit icon next to any organization to update:
        </Paragraph>
        <BulletList items={[
          'Organization name',
          'Status (active, inactive, suspended, trial)',
          'Subscription tier',
          'Google API Key',
        ]} />

        <Warning>
          Changing an organization's status to Inactive or Suspended will prevent all users in that
          organization from accessing the platform.
        </Warning>
      </>
    ),
  },
  {
    id: 'workshops',
    title: 'Workshops',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    content: (
      <>
        <SectionHeading>Managing Workshops</SectionHeading>
        <Paragraph>
          Workshops are structured learning experiences that guide participants through exercises.
          Instructors can create, organize, and track participant progress through workshops.
        </Paragraph>

        <SubHeading>Workshop Structure</SubHeading>
        <Paragraph>
          Each workshop consists of:
        </Paragraph>
        <BulletList items={[
          <><strong>Title & Description</strong> - The name and overview of the workshop</>,
          <><strong>Exercises</strong> - Individual learning activities within the workshop</>,
          <><strong>Progress Tracking</strong> - Automatic tracking of participant completion</>,
        ]} />

        <SubHeading>Creating a Workshop</SubHeading>
        <Paragraph>
          Workshops can be created from the Workshops page (not the Admin Console). Navigate to
          the Workshops section from the main navigation and click "Create Workshop".
        </Paragraph>

        <SubHeading>Workshop Status</SubHeading>
        <BulletList items={[
          <><strong>Draft</strong> - Workshop is being developed and not visible to participants</>,
          <><strong>Active</strong> - Workshop is live and available to participants</>,
          <><strong>Completed</strong> - Workshop has ended</>,
          <><strong>Archived</strong> - Workshop is hidden but data is preserved</>,
        ]} />

        <Tip>
          Use the Setup Wizard on the Workshops page to quickly configure workshops for your organization.
        </Tip>
      </>
    ),
  },
  {
    id: 'guides',
    title: 'Guides',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    content: (
      <>
        <SectionHeading>Managing Guides</SectionHeading>
        <Paragraph>
          Guides are documentation pages that provide helpful information to users. They appear
          in the Guides section of the platform and can be used for tutorials, how-to articles,
          best practices, and reference documentation.
        </Paragraph>

        <SubHeading>Creating a Guide</SubHeading>
        <NumberedList items={[
          'Click "Add Guide" in the top right corner',
          'Enter the guide title (this auto-generates a URL slug)',
          'Write a brief description that appears in the guide list',
          'Select an icon that represents the guide content',
          'Set the display order (lower numbers appear first)',
          'Write the full content using HTML markup',
          'Check "Published" to make the guide visible to users',
          'Click "Create Guide" to save',
        ]} />

        <FieldTable fields={[
          { name: 'Title', required: true, description: 'The guide title displayed to users' },
          { name: 'Slug', required: true, description: 'URL path for the guide (e.g., "getting-started")' },
          { name: 'Description', required: true, description: 'Brief summary shown in the guide list' },
          { name: 'Icon', required: true, description: 'Visual icon (book, rocket, terminal, wrench, or play)' },
          { name: 'Display Order', required: false, description: 'Numeric value for sorting (lower = first)' },
          { name: 'Content HTML', required: true, description: 'Full guide content in HTML format' },
          { name: 'Published', required: false, description: 'Whether the guide is visible to users' },
        ]} />

        <SubHeading>Writing Guide Content</SubHeading>
        <Paragraph>
          Guide content supports HTML formatting. Common elements you can use:
        </Paragraph>
        <BulletList items={[
          <><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;h2&gt;</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;h3&gt;</code> - Section headings</>,
          <><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;p&gt;</code> - Paragraphs</>,
          <><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;ul&gt;</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;ol&gt;</code> - Bullet and numbered lists</>,
          <><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;code&gt;</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;pre&gt;</code> - Code snippets</>,
          <><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;a href="..."&gt;</code> - Links</>,
          <><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;strong&gt;</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;em&gt;</code> - Bold and italic text</>,
        ]} />

        <SubHeading>Publishing and Unpublishing</SubHeading>
        <Paragraph>
          Guides can be in one of two states:
        </Paragraph>
        <BulletList items={[
          <><strong>Published</strong> - Visible to all users in the Guides section</>,
          <><strong>Draft</strong> - Only visible in the admin console, not to regular users</>,
        ]} />

        <Tip>
          Use the Draft status to work on guides before making them public. You can preview the
          content in the edit modal before publishing.
        </Tip>

        <SubHeading>Bulk Actions</SubHeading>
        <Paragraph>
          Select multiple guides to:
        </Paragraph>
        <BulletList items={[
          'Publish all selected guides at once',
          'Unpublish (set to draft) all selected guides',
          'Delete multiple guides',
        ]} />

        <Warning>
          Deleting a guide is permanent and cannot be undone. Make sure you have a backup of important
          content before deleting.
        </Warning>
      </>
    ),
  },
  {
    id: 'library',
    title: 'Library',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    content: (
      <>
        <SectionHeading>Managing Library Resources</SectionHeading>
        <Paragraph>
          The Library contains learning resources such as articles, videos, PDFs, tools, courses, and
          documentation. Users can browse, search, and bookmark resources for later reference.
        </Paragraph>

        <SubHeading>Resource Types</SubHeading>
        <BulletList items={[
          <><strong>Article</strong> - Written content, blog posts, or tutorials</>,
          <><strong>Video</strong> - Video tutorials or presentations</>,
          <><strong>PDF</strong> - Downloadable PDF documents</>,
          <><strong>Tool</strong> - Links to useful tools and utilities</>,
          <><strong>Course</strong> - Structured learning courses</>,
          <><strong>Documentation</strong> - Reference documentation</>,
        ]} />

        <SubHeading>Creating a Resource</SubHeading>
        <NumberedList items={[
          'Click "Add Resource" in the top right corner',
          'Enter the resource title and description',
          'Select the resource type',
          'Choose the source type and provide content',
          'Set the difficulty level',
          'Select relevant topics (optional)',
          'Add author and estimated time (optional)',
          'Check "Featured" to highlight on the homepage',
          'Click "Create Resource" to save',
        ]} />

        <SubHeading>Source Types</SubHeading>
        <Paragraph>
          Resources can have three different source types:
        </Paragraph>
        <BulletList items={[
          <><strong>External Link</strong> - Link to a resource on another website. Enter the full URL.</>,
          <><strong>Embedded Content</strong> - HTML or Markdown content hosted on the platform. Ideal for original content.</>,
          <><strong>Upload File</strong> - Upload a PDF document directly (max 50MB). Only available for PDF resource type.</>,
        ]} />

        <FieldTable fields={[
          { name: 'Title', required: true, description: 'The resource title' },
          { name: 'Description', required: true, description: 'Brief description of the resource' },
          { name: 'Type', required: true, description: 'Article, Video, PDF, Tool, Course, or Documentation' },
          { name: 'Source', required: true, description: 'External Link, Embedded Content, or Upload File' },
          { name: 'Difficulty', required: true, description: 'Beginner, Intermediate, or Advanced' },
          { name: 'Topics', required: false, description: 'Categories like Agent Fundamentals, Prompt Engineering, etc.' },
          { name: 'Author', required: false, description: 'Creator or source of the resource' },
          { name: 'Estimated Time', required: false, description: 'Time in minutes to consume the resource' },
          { name: 'Thumbnail URL', required: false, description: 'Image URL for resource preview' },
          { name: 'Featured', required: false, description: 'Show on homepage featured section' },
        ]} />

        <SubHeading>Uploading PDF Documents</SubHeading>
        <Paragraph>
          To upload a PDF:
        </Paragraph>
        <NumberedList items={[
          'Select "PDF" as the resource type',
          'Choose "Upload File" as the source type',
          'Drag and drop a PDF file or click to browse',
          'Wait for the upload to complete (progress bar will show)',
          'The file will be stored securely and accessible to users',
        ]} />

        <Warning>
          PDF uploads are limited to 50MB per file. Ensure your PDFs are optimized for web viewing.
        </Warning>

        <SubHeading>Featuring Resources</SubHeading>
        <Paragraph>
          Featured resources appear in the "Featured Learning" section on the homepage. Use this
          to highlight important or popular content.
        </Paragraph>
        <BulletList items={[
          'Check the "Featured" checkbox when creating/editing a resource',
          'Use bulk actions to feature/unfeature multiple resources at once',
          'Limit featured resources to 4-6 for the best user experience',
        ]} />

        <SubHeading>Filtering and Searching</SubHeading>
        <Paragraph>
          Use the filter options to find resources:
        </Paragraph>
        <BulletList items={[
          'Search by title, description, or author',
          'Filter by resource type (Article, Video, PDF, etc.)',
          'Filter by difficulty level',
          'Filter by featured status',
        ]} />
      </>
    ),
  },
  {
    id: 'announcements',
    title: "What's New",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    content: (
      <>
        <SectionHeading>Managing Announcements</SectionHeading>
        <Paragraph>
          Announcements appear in the "What's New" section on the user dashboard. Use them to
          communicate updates, new features, new content, and important news to your users.
        </Paragraph>

        <SubHeading>Creating an Announcement</SubHeading>
        <NumberedList items={[
          'Click "Add Announcement" in the top right corner',
          'Enter a title (max 255 characters)',
          'Write a description (max 500 characters)',
          'Select the announcement type',
          'Optionally add a link URL for users to learn more',
          'Optionally add a badge (e.g., "NEW", "UPDATED")',
          'Set the display order',
          'Check "Active" to show on the dashboard',
          'Click "Create Announcement" to save',
        ]} />

        <FieldTable fields={[
          { name: 'Title', required: true, description: 'Short headline for the announcement' },
          { name: 'Description', required: true, description: 'Detailed message (max 500 characters)' },
          { name: 'Type', required: true, description: 'Category: General, Workshop, Guide, Library, News, or Feature' },
          { name: 'Link URL', required: false, description: 'Internal path (e.g., /workshops) or external URL' },
          { name: 'Badge Text', required: false, description: 'Short label like "NEW" or "UPDATED"' },
          { name: 'Badge Color', required: false, description: 'Blue, Green, Amber, Red, or Purple' },
          { name: 'Display Order', required: false, description: 'Lower numbers appear first' },
          { name: 'Active', required: false, description: 'Whether to show on the dashboard' },
        ]} />

        <SubHeading>Announcement Types</SubHeading>
        <BulletList items={[
          <><strong>General</strong> - General announcements and updates</>,
          <><strong>Workshop</strong> - New or updated workshops</>,
          <><strong>Guide</strong> - New documentation or guides</>,
          <><strong>Library Resource</strong> - New learning resources</>,
          <><strong>News</strong> - Platform or industry news</>,
          <><strong>New Feature</strong> - New platform features or capabilities</>,
        ]} />

        <SubHeading>Using Badges</SubHeading>
        <Paragraph>
          Badges help draw attention to announcements:
        </Paragraph>
        <BulletList items={[
          <><strong>Badge Text</strong> - Short text displayed on a colored pill (e.g., "NEW", "BETA", "UPDATED")</>,
          <><strong>Badge Color</strong> - Choose from Blue, Green, Amber, Red, or Purple to match the tone</>,
        ]} />

        <Tip>
          Use green badges for positive announcements, amber for important notices, and blue for
          informational updates. Keep badge text to 1-2 words for best appearance.
        </Tip>

        <SubHeading>Link URLs</SubHeading>
        <Paragraph>
          Add links to direct users to relevant content:
        </Paragraph>
        <BulletList items={[
          <><strong>Internal links</strong> - Start with "/" (e.g., "/workshops", "/guides/getting-started")</>,
          <><strong>External links</strong> - Full URLs (e.g., "https://example.com")</>,
        ]} />

        <SubHeading>Managing Display Order</SubHeading>
        <Paragraph>
          The display order determines the sequence of announcements on the dashboard:
        </Paragraph>
        <BulletList items={[
          'Lower numbers appear first (0, 1, 2...)',
          'Use increments of 10 to leave room for future insertions',
          'Announcements with the same order are sorted by creation date',
        ]} />

        <SubHeading>Activating and Deactivating</SubHeading>
        <Paragraph>
          Control visibility without deleting:
        </Paragraph>
        <BulletList items={[
          <><strong>Active</strong> - Announcement is visible on user dashboards</>,
          <><strong>Inactive</strong> - Announcement is hidden but preserved in the system</>,
        ]} />

        <Warning>
          Inactive announcements are still stored in the database. Delete announcements you no longer
          need to keep your list manageable.
        </Warning>
      </>
    ),
  },
  {
    id: 'tips',
    title: 'Best Practices',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    content: (
      <>
        <SectionHeading>Best Practices for Content Management</SectionHeading>

        <SubHeading>Content Organization</SubHeading>
        <BulletList items={[
          'Use consistent naming conventions for all content',
          'Keep titles concise but descriptive',
          'Write descriptions that help users understand what they\'ll find',
          'Use display order strategically to surface important content first',
          'Regularly review and archive outdated content',
        ]} />

        <SubHeading>Guides Best Practices</SubHeading>
        <BulletList items={[
          'Start with a clear introduction explaining the guide\'s purpose',
          'Break content into sections with descriptive headings',
          'Use bullet points and numbered lists for easy scanning',
          'Include code examples with proper formatting',
          'Add links to related guides and resources',
          'Keep guides focused on one topic - create multiple guides rather than one long one',
        ]} />

        <SubHeading>Library Best Practices</SubHeading>
        <BulletList items={[
          'Curate quality over quantity - only add genuinely useful resources',
          'Verify external links regularly to avoid broken links',
          'Use accurate difficulty levels to set proper expectations',
          'Add relevant topics to help users filter effectively',
          'Include estimated time to help users plan their learning',
          'Feature a mix of resource types for variety',
        ]} />

        <SubHeading>Announcements Best Practices</SubHeading>
        <BulletList items={[
          'Keep announcements brief and action-oriented',
          'Use badges sparingly to maintain their impact',
          'Remove or deactivate old announcements regularly',
          'Limit active announcements to 5-7 for best readability',
          'Always include a link when there\'s more to explore',
          'Use appropriate types to help users filter',
        ]} />

        <SubHeading>User Management Best Practices</SubHeading>
        <BulletList items={[
          'Use the principle of least privilege when assigning roles',
          'Deactivate accounts promptly when users leave',
          'Regularly audit user roles and access',
          'Document your organization\'s role assignment policies',
        ]} />

        <Tip>
          Schedule regular content reviews (monthly or quarterly) to keep your platform fresh and relevant.
          Archive or update content that's no longer accurate.
        </Tip>

        <SubHeading>Troubleshooting Common Issues</SubHeading>
        <Paragraph>
          <strong>Content not appearing to users:</strong>
        </Paragraph>
        <BulletList items={[
          'Guides: Check that the guide is set to "Published"',
          'Announcements: Verify the announcement is set to "Active"',
          'Library: Ensure the resource was saved successfully',
        ]} />

        <Paragraph>
          <strong>Users can\'t access certain features:</strong>
        </Paragraph>
        <BulletList items={[
          'Verify the user\'s role has the required permissions',
          'Check that the user\'s account is active',
          'Confirm the user is in the correct organization',
        ]} />

        <Paragraph>
          <strong>PDF upload fails:</strong>
        </Paragraph>
        <BulletList items={[
          'Check file size is under 50MB',
          'Ensure the file is a valid PDF format',
          'Try compressing the PDF and re-uploading',
        ]} />
      </>
    ),
  },
]

export function AdminHelpTab() {
  const [activeSection, setActiveSection] = useState(helpSections[0].id)

  const currentSection = helpSections.find(s => s.id === activeSection)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Admin User Guide
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Learn how to manage content and users on the platform
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Documentation
              </span>
            </div>
            <ul className="py-2">
              {helpSections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                      activeSection === section.id
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                    )}
                  >
                    <span className={cn(
                      'flex-shrink-0',
                      activeSection === section.id
                        ? 'text-primary-500'
                        : 'text-gray-400'
                    )}>
                      {section.icon}
                    </span>
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {currentSection?.content}
          </div>
        </div>
      </div>
    </div>
  )
}
