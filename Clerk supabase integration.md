Integrating Supabase with Clerk gives you the benefits of using a Supabase database while leveraging Clerk's authentication, prebuilt components, and webhooks. To get the most out of Supabase with Clerk, you must implement custom [Row Level Security⁠](https://supabase.com/docs/guides/auth/row-level-security) (RLS) policies.

RLS works by validating database queries according to the restrictions defined in the RLS policies applied to the table. This guide will show you how to create RLS policies that restrict access to data based on the user's Clerk ID. This way, users can only access data that belongs to them. To set this up, you will:

- Create a function in Supabase to parse the Clerk user ID from the authentication token.
- Create a `user_id` column that defaults to the Clerk user's ID when new records are created.
- Create policies to restrict what data can be read and inserted.
- Use the Clerk Supabase integration helper in your code to authenticate with Supabase and execute queries.

This guide will have you create a new table in your [Supabase project⁠](https://supabase.com/dashboard/projects), but you can apply these concepts to your existing tables as well.

Tip

This integration restricts what data authenticated users can access in the database, but does not synchronize user records between Clerk and Supabase. To send additional data from Clerk to your Supabase database, use [webhooks](https://clerk.com/docs/webhooks/overview).

## [Choose your own adventure](https://clerk.com/docs/integrations/databases/supabase#choose-your-own-adventure)

For interacting with the Supabase dashboard, you can either use the **Supabase interface** or the **SQL Editor**. The **SQL Editor** is a more direct way to interact with your database, but the **Supabase interface** provides a more user-friendly experience.

### [Create a SQL query that checks the user ID](https://clerk.com/docs/integrations/databases/supabase#create-a-sql-query-that-checks-the-user-id)

Create a function named `requesting_user_id()` that will parse the Clerk user ID from the authentication token. This function will be used to set the default value of `user_id` in a table and in the RLS policies to ensure the user can only access their data.

Supabase interface

SQL Editor

1. In the sidebar of your [Supabase dashboard⁠](https://supabase.com/dashboard/projects), navigate to **Database** > **Functions**.
2. Select **Create a new function**.
3. In the **Add a new function** sheet, make the following changes:
    
    - Set **Name of function** to `requesting_user_id`.
    - Set **Return type** to `text`.
    - Toggle **Show advanced settings** on.
    - Set **Language** to `sql`.
    - Populate the **Definition** with the following sql:
        
        ```
        SELECT NULLIF(
            current_setting('request.jwt.claims', true)::json->>'sub',
            ''
        )::text;
        ```
        
    - Select **Confirm**.
    

### [Create a table and enable RLS on it](https://clerk.com/docs/integrations/databases/supabase#create-a-table-and-enable-rls-on-it)

Next, you'll create a `tasks` table and enable RLS on that table. The `tasks` table will also contain a `user_id` column that will use the `requesting_user_id()` function you just created as it's default value. This column will be used in the RLS policies to only return or modify records scoped to the user's account.

Supabase interface

SQL Editor

In the left navigation, select **Table Editor** and select **Create a new table**. In the sheet that appears in the right, configure the following settings:

- Name: `tasks`.
- Toggle on **Enable Row Level Security (RLS).**
- Set up the **Columns** with the following configuration:
    
    |Name|Type|Default value|Primary|Additional settings (Gear icon)|
    |---|---|---|---|---|
    |id|int8|_NULL_|Checked|Is identity|
    |name|text||||
    |user_id|text|requesting_user_id()|||
    
- Select **Save**.

### [Create ID-based RLS policies](https://clerk.com/docs/integrations/databases/supabase#create-id-based-rls-policies)

Create RLS policies that permit users to read and insert content associated with their user IDs only.

Supabase interface

SQL Editor

In the sidebar, navigate to **Authentication** > **Policies**. Create policies that allow your users to read and insert data into the `tasks` table:

1. Select **Create policy** to create the `SELECT` policy:
    
    - Name: "Select tasks policy".
    - For **Policy Command**, select **SELECT**.
    - For **Target roles**, select **authenticated**.
    - Replace the "-- Provide a SQL expression for the using statement" with the following:
        
        Supabase policy editor
        
        ```
        requesting_user_id() = user_id
        ```
        
    - Select **Save policy**.
    
2. Select **Create policy** to create the `INSERT` policy:
    
    - Name: "Insert task policy".
    - For **Policy Command**, select **INSERT**.
    - For **Target roles**, select **authenticated**.
    - Replace the "-- Provide a SQL expression for the with check statement" with the following:
        
        Supabase policy editor
        
        ```
        requesting_user_id() = user_id
        ```
        
    - Select **Save policy**.
    

### [Get your Supabase JWT Secret Key](https://clerk.com/docs/integrations/databases/supabase#get-your-supabase-jwt-secret-key)

To give users access to your data, Supabase's API requires an authentication token. Your Clerk project can generate these authentication tokens, but it needs your Supabase project's JWT Secret Key first.

To find the JWT Secret Key:

1. In the sidebar, navigate to **Project Settings > API**.
2. Under the **JWT Settings** section, save the value in the **JWT Secret** field somewhere secure. This value will be used in the next step.

### [Create a Supabase JWT template](https://clerk.com/docs/integrations/databases/supabase#create-a-supabase-jwt-template)

Clerk's JWT templates allow you to generate a new valid Supabase authentication token for each signed in user. These tokens allow authenticated users to access your data with Supabase's API.

To create a JWT template for Supabase:

1. In the Clerk Dashboard, navigate to the [**JWT templates**⁠](https://dashboard.clerk.com/last-active?path=jwt-templates) page.
2. Select the **New template** button, then select **Supabase** from the list of options.
3. Configure your template:
    
    - The value of the **Name** field will be required when using the template in your code. For this tutorial, name it `supabase`.
    - **Signing algorithm** will be `HS256` by default. This algorithm is required to use JWTs with Supabase. [Learn more in their docs⁠](https://supabase.com/docs/guides/resources/glossary#jwt-signing-secret).
    - Under **Signing key**, add the value of your Supabase **JWT Secret Key** from [the previous step](https://clerk.com/docs/integrations/databases/supabase#get-your-supabase-jwt-secret-key).
    - You can leave all other fields at their default settings or customize them to your needs. See the [JWT template guide](https://clerk.com/docs/backend-requests/making/jwt-templates#creating-a-template) to learn more about these settings.
    - Select **Save** from the notification bubble to complete setup.
    

### [Install the Supabase client library](https://clerk.com/docs/integrations/databases/supabase#install-the-supabase-client-library)

Add the Supabase client library to your project.

npm

yarn

pnpm

terminal

```
npm i @supabase/supabase-js
```

### [Set up your environment variables](https://clerk.com/docs/integrations/databases/supabase#set-up-your-environment-variables)

1. In the sidebar of the [Supabase dashboard⁠](https://supabase.com/dashboard/projects), select **Settings** > **API**.
2. Add the **Project URL** to your `.env.local` file as `SUPABASE_URL`.
3. In the **Project API keys** section, add the value beside `anon` `public` to your `.env.local` file as `SUPABASE_KEY`.

Important

If you are using Next.js, the `NEXT_PUBLIC_` prefix is required for environment variables that are used in the client-side code.

### [Fetch Supabase data in your code](https://clerk.com/docs/integrations/databases/supabase#fetch-supabase-data-in-your-code)

The following example shows the list of tasks for the user and allows the user to add new tasks.

The `createClerkSupabaseClient()` function uses [Supabase's `createClient()` method⁠](https://supabase.com/docs/reference/javascript/initializing) to initialize a new Supabase client, but modifies it to inject the Clerk token you [created with the Supabase JWT template](https://clerk.com/docs/integrations/databases/supabase#create-a-supabase-jwt-template) into the request headers sent to Supabase. The `requesting_user_id()` function that was created in the Supabase dashboard will parse this token to use it when querying data from the `tasks` table.

Client-side rendering

Server-side rendering

The following example uses the [Next.js SDK](https://clerk.com/docs/references/nextjs/overview) to access the [`useUser()`](https://clerk.com/docs/references/react/use-user) and [`useSession()`](https://clerk.com/docs/references/react/use-session) hooks, but you can adapt this code to work with any React-based Clerk SDK.

app/page.tsx

```
'use client'
import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  // The `useUser()` hook will be used to ensure that Clerk has loaded data about the logged in user
  const { user } = useUser()
  // The `useSession()` hook will be used to get the Clerk session object
  const { session } = useSession()

  // Create a custom supabase client that injects the Clerk Supabase token into the request headers
  function createClerkSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          // Get the custom Supabase token from Clerk
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({
              template: 'supabase',
            })

            // Insert the Clerk Supabase token into the headers
            const headers = new Headers(options?.headers)
            headers.set('Authorization', `Bearer ${clerkToken}`)

            // Now call the default fetch
            return fetch(url, {
              ...options,
              headers,
            })
          },
        },
      },
    )
  }

  // Create a `client` object for accessing Supabase data using the Clerk token
  const client = createClerkSupabaseClient()

  // This `useEffect` will wait for the User object to be loaded before requesting
  // the tasks for the logged in user
  useEffect(() => {
    if (!user) return

    async function loadTasks() {
      setLoading(true)
      const { data, error } = await client.from('tasks').select()
      if (!error) setTasks(data)
      setLoading(false)
    }

    loadTasks()
  }, [user])

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Insert task into the "tasks" database
    await client.from('tasks').insert({
      name,
    })
    window.location.reload()
  }

  return (
    <div>
      <h1>Tasks</h1>

      {loading && <p>Loading...</p>}

      {!loading && tasks.length > 0 && tasks.map((task: any) => <p>{task.name}</p>)}

      {!loading && tasks.length === 0 && <p>No tasks found</p>}

      <form onSubmit={createTask}>
        <input
          autoFocus
          type="text"
          name="name"
          placeholder="Enter new task"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  )
}
```

### [Test your integration](https://clerk.com/docs/integrations/databases/supabase#test-your-integration)

Run your project and sign in. Test creating and viewing tasks. Sign out and sign in as a different user, and repeat.

If you have the same tasks across multiple accounts, double check that RLS is enabled, or that the RLS policies were properly created. Check the table in the Supabase dashboard. You should see all the tasks between both users, but with differing values in the `user_id` column.