'use client'

export default function AdminError({ reset }: { error: Error; reset: () => void }) { return <div className="admin-empty"><h2>Admin data could not be loaded</h2><p>The operation failed safely. No raw database details were exposed.</p><button className="admin-button" type="button" onClick={reset}>Try again</button></div> }
