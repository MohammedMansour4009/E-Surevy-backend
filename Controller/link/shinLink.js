const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch data from the URL and extract shareId
async function fetchProductDataWithCheerio(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extract entire text content from the body
        const bodyText = $('body').text().trim();

        // Use a regular expression to extract the shareInfo JavaScript object
        const shareInfoMatch = bodyText.match(/var\s+shareInfo\s*=\s*({.*?});/s);

        if (!shareInfoMatch) {
            console.error('shareInfo JavaScript object not found in body text');
            return null;
        }

        // Extract the JavaScript object as a string
        const shareInfoString = shareInfoMatch[1]; // Extract the object string

        // Use eval safely to convert the JavaScript object string to an actual object
        const shareInfo = eval(`(${shareInfoString})`);

        // Extract shareId from the parsed object
        const shareId = shareInfo.shareId;


        // Return just the extracted shareId
        return { shareId };
    } catch (error) {
        console.error('Error fetching product data with Cheerio:', error);
        throw error;
    }
}

// Function to send HTTP request to the specified endpoint with shareId as group_id
async function sendRequestWithGroupId(groupId) {
    try {
        const url = `https://m.shein.com/ar-en/api/cart/socialShareGoodsInfo/get?_ver=1.1.8&_lang=en&group_id=${groupId}&local_country=JO`;

        // Define headers
        const headers = {
            'Cookie': 'cookieId=85E7DA55_4F17_4EE4_393F_E3C0A7A5C03F; sessionID_shein_m_pwa=s%3AfJgq7QI5PohBnYFFHySxhlM990aZ2uKV.Q62ht2tf4YZ7XFk525ODcAmLGN0Gq%2FjJQ48UTTsy%2Bws'
        };

        // Send the GET request using Axios
        const response = await axios.get(url, { headers });


        return response;
    } catch (error) {
        console.error('Error making request with group_id:', error);
        throw error;
    }
}


// Function to map the response to simplified names
function mapGoodsDataToSimpleNames(originalResponse) {
    // Check if the goods property exists

    console.log('goods from API:', originalResponse.data);

    // Extract the goods data from the original response
    const goods = originalResponse.data.goods;
    console.log('goods from API:', originalResponse.data);
    console.log('goods from API:', goods);

    // Map each item in the goods array to the desired structure with simplified names
    const mappedGoods = goods.map(good => ({
        item_id: good.goods_id,  // Renamed from goods_id to item_id
        qrCodeId: good.goods_sn,  // Renamed from goods_sn to qrCodeId
        title: good.goods_name,  // Renamed from goods_name to title
        product_type: good.sku_sale_attr[0]?.attr_name,  // Renamed sku_sale_attr to product_type
        product_value: good.sku_sale_attr[0]?.attr_value_name,  // Renamed sku_sale_attr to product_value
        attr_name: good.sku_main_sale_attr.attr_name,  // Renamed from sku_main_sale_attr to attr_name
        attr_value: good.sku_main_sale_attr.attr_value_name,  // Renamed from sku_main_sale_attr to attr_value
        priceBeforeSele:good.retail_price.amount,
        price:good.sale_price.amount
    }));

    console.log(`mappedGoods ${mappedGoods.length}`);

    return mappedGoods;
}

// Endpoint to parse link and fetch product data
exports.parseLink = async (req, res) => {
    const { url } = req.body;

    // Log request body for debugging
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    // Validate URL
    if (!url || !isValidURL(url)) {
        return res.status(400).json({ error: 'A valid URL is required.' });
    }

    try {
        // Step 1: Extract shareId using Cheerio
        const productData = await fetchProductDataWithCheerio(url); // Cheerio

        if (!productData || !productData.shareId) {
            return res.status(500).json({ error: 'Failed to fetch product data or shareId not found.' });
        }

        // Step 2: Send request with shareId as group_id
        const apiResponse = await sendRequestWithGroupId(productData.shareId);

        if (apiResponse) {
            // Step 3: Map the API response to simplified names
            const simplifiedGoodsData = mapGoodsDataToSimpleNames(apiResponse);

            res.status(201).json({ message: 'Data fetched and API request successful', data: simplifiedGoodsData });
        } else {
            res.status(500).json({ error: 'Failed to make API request or invalid API response format.' });
        }
    } catch (error) {
        console.error('Error in /parse-link route:', error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
};

// Utility function to validate a URL
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

