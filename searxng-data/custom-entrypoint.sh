#!/bin/sh
# Custom entrypoint to rebrand SearXNG to Zeq OS Privacy Search

# Call original entrypoint first to set up everything
/usr/local/searxng/entrypoint.sh &
ENTRYPOINT_PID=$!

# Wait a moment for templates to be available
sleep 3

# Patch only the visible text, being careful with Jinja2 syntax
if [ -f "/usr/local/searxng/searx/templates/simple/index.html" ]; then
    sed -i 's|SearXNG|Zeq OS Privacy Search|g' /usr/local/searxng/searx/templates/simple/index.html
fi

if [ -f "/usr/local/searxng/searx/templates/simple/base.html" ]; then
    # Only replace in meta description and keywords, not in template variables
    sed -i 's|content="SearXNG|content="Zeq OS Privacy Search|g' /usr/local/searxng/searx/templates/simple/base.html
    sed -i 's|>SearXNG<|>Zeq OS Privacy Search<|g' /usr/local/searxng/searx/templates/simple/base.html
fi

if [ -f "/usr/local/searxng/searx/templates/simple/search.html" ]; then
    sed -i 's|SearXNG|Zeq OS Privacy Search|g' /usr/local/searxng/searx/templates/simple/search.html
fi

# Wait for entrypoint to finish
wait $ENTRYPOINT_PID
